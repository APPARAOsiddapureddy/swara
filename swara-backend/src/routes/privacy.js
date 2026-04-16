const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/privacy/export — export the user's data as JSON
router.get('/export', async (req, res) => {
  try {
    const [user, lovedOnes, conversations, blessings, memorySummaries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, phone: true, createdAt: true, subscriptionTier: true },
      }),
      prisma.lovedOne.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.conversation.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.blessing.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.memorySummary.findMany({
        where: { lovedOne: { userId: req.user.id } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.json({
      exportedAt: new Date().toISOString(),
      user,
      lovedOnes,
      conversations,
      blessings,
      memorySummaries,
    });
  } catch (err) {
    console.error('Privacy export error:', err);
    return res.status(500).json({ error: 'Export failed', message: err.message });
  }
});

// GET /api/privacy/consent-records — list consent status for loved ones
router.get('/consent-records', async (req, res) => {
  try {
    const lovedOnes = await prisma.lovedOne.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        relation: true,
        isDeceased: true,
        consentType: true,
        voiceAccepted: true,
        createdAt: true,
      },
    });
    return res.json({ lovedOnes });
  } catch (err) {
    console.error('Consent records error:', err);
    return res.status(500).json({ error: 'Failed to fetch consent records', message: err.message });
  }
});

// POST /api/privacy/report-abuse — submit an abuse report
router.post('/report-abuse', async (req, res) => {
  try {
    const { lovedOneId, message, contact } = req.body || {};
    if (!message || String(message).trim().length < 5) {
      return res.status(400).json({ error: 'message is required (min 5 chars)' });
    }

    let lovedOne = null;
    if (lovedOneId) {
      lovedOne = await prisma.lovedOne.findFirst({ where: { id: lovedOneId, userId: req.user.id } });
      if (!lovedOne) return res.status(404).json({ error: 'Loved one not found' });
    }

    const report = await prisma.abuseReport.create({
      data: {
        userId: req.user.id,
        lovedOneId: lovedOne ? lovedOne.id : null,
        message: String(message).trim(),
        contact: contact != null ? String(contact).trim() : null,
      },
    });

    return res.status(201).json({ reportId: report.id, message: 'Report submitted' });
  } catch (err) {
    console.error('Report abuse error:', err);
    return res.status(500).json({ error: 'Failed to submit report', message: err.message });
  }
});

// POST /api/privacy/delete-all — delete all user data (and user)
router.post('/delete-all', async (req, res) => {
  try {
    const confirm = String(req.body?.confirm || '').trim();
    if (confirm !== 'DELETE') {
      return res.status(400).json({ error: 'confirm must be exactly "DELETE"' });
    }

    // Delete in dependency order.
    await prisma.blessing.deleteMany({ where: { userId: req.user.id } });
    await prisma.conversation.deleteMany({ where: { userId: req.user.id } });

    const lovedOnes = await prisma.lovedOne.findMany({
      where: { userId: req.user.id },
      select: { id: true },
    });
    const lovedOneIds = lovedOnes.map((l) => l.id);

    if (lovedOneIds.length) {
      await prisma.memorySummary.deleteMany({ where: { lovedOneId: { in: lovedOneIds } } });
      await prisma.abuseReport.deleteMany({ where: { lovedOneId: { in: lovedOneIds } } });
    }
    await prisma.abuseReport.deleteMany({ where: { userId: req.user.id } });

    await prisma.lovedOne.deleteMany({ where: { userId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });

    return res.json({ message: 'All data deleted' });
  } catch (err) {
    console.error('Delete all data error:', err);
    return res.status(500).json({ error: 'Delete failed', message: err.message });
  }
});

module.exports = router;

