const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  createdAt: user.createdAt,
  subscriptionTier: user.subscriptionTier || 'free',
});

const isValidTestOtp = (otp) => String(otp || '') === '0000';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, otp } = req.body;

    // Testing-phase OTP: accept 0000 for everyone.
    // Keep password support for older clients.
    if (!name || !phone || (!password && !otp)) {
      return res.status(400).json({ error: 'name, phone, and otp are required' });
    }

    if (otp != null && !isValidTestOtp(otp)) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const passwordHash = password ? await bcrypt.hash(password, 12) : await bcrypt.hash(`otp:${phone}`, 12);

    const user = await prisma.user.create({
      data: { name, phone, passwordHash },
    });

    const token = generateToken(user.id);

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password, otp } = req.body;

    if (!phone || (!password && !otp)) {
      return res.status(400).json({ error: 'phone and otp are required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (otp != null) {
      if (!isValidTestOtp(otp)) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
    } else {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const token = generateToken(user.id);

    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// POST /api/auth/dev-set-premium — local/dev only: flip user to premium for QA
router.post('/dev-set-premium', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ error: 'Bearer token required' });
    }
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { subscriptionTier: 'premium' },
    });
    return res.json({ user: sanitizeUser(user), message: 'User set to premium (dev only)' });
  } catch (err) {
    console.error('dev-set-premium error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
