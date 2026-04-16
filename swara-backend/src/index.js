require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const lovedOneRoutes = require('./routes/lovedOne');
const conversationRoutes = require('./routes/conversation');
const blessingRoutes = require('./routes/blessing');
const privacyRoutes = require('./routes/privacy');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure local uploads directory exists (dev fallback)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads in dev
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    voiceProvider: process.env.VOICE_PROVIDER || (process.env.CARTESIA_API_KEY ? 'cartesia' : 'elevenlabs'),
  });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/loved-one', authMiddleware, lovedOneRoutes);
app.use('/api/conversation', authMiddleware, conversationRoutes);
app.use('/api/blessing', authMiddleware, blessingRoutes);
app.use('/api/privacy', authMiddleware, privacyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`Swara backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `\n[Swara] Port ${PORT} is already in use.\n` +
        `  • Stop the other process: lsof -i :${PORT}   then kill the PID, or\n` +
        `  • Use another port: PORT=3001 npm run dev\n` +
        `  • Point the app at the same port (API_URL / EXPO_PUBLIC_API_URL).\n`
    );
  } else {
    console.error('[Swara] HTTP server error:', err);
  }
  process.exit(1);
});

module.exports = app;
