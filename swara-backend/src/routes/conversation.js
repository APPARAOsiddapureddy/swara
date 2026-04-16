const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { transcribeAudio } = require('../services/whisper');
const { generateResponse } = require('../services/claude');
const voiceService = require('../services/voiceService');
const { uploadFile } = require('../services/storage');
const { buildSystemPrompt } = require('./lovedOne');
const { createSummaryForLovedOne } = require('../services/memorySummary');

const router = express.Router();
const prisma = new PrismaClient();

const CONFIDENCE_KEYWORDS = [
  'meeting', 'interview', 'launch', 'exam', 'decision', 'presentation',
  'promotion', 'proposal', 'audition', 'competition', 'challenge', 'test',
  'job', 'application', 'deadline', 'project',
  'పరీక్ష', 'ఇంటర్వ్యూ', 'మీటింగ్', 'నిర్ణయం', 'పోటీ', 'సవాల్',
  'ప్రదర్శన', 'అడ్డంకి', 'అవకాశం', 'ముఖ్యమైన',
];

const detectConfidence = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CONFIDENCE_KEYWORDS.some((keyword) => lower.includes(keyword.toLowerCase()));
};

function deepeningStageFromCount(n) {
  if (n >= 150) return 'LIVING';
  if (n >= 75) return 'FAMILIARITY';
  if (n >= 30) return 'PERSONALITY';
  if (n >= 10) return 'RECOGNITION';
  return 'FOUNDATION';
}

const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Testing phase: treat all users as premium (no paywalls / feature gating).
const isPremium = () => true;

// POST /api/conversation/send
router.post('/send', upload.single('audio'), async (req, res) => {
  try {
    const { lovedOneId, mode } = req.body;

    if (!lovedOneId) {
      return res.status(400).json({ error: 'lovedOneId is required' });
    }

    // No gating: confidence mode available for everyone.

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: lovedOneId, userId: req.user.id },
    });

    if (!lovedOne) {
      return res.status(404).json({ error: 'Loved one not found' });
    }

    const userMessage = await transcribeAudio(
      req.file.buffer,
      req.file.originalname || 'audio.mp3',
      req.file.mimetype
    );

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(422).json({ error: 'Could not transcribe audio — please speak clearly and try again' });
    }

    const memoryLimit = 10;

    const recentConversations = await prisma.conversation.findMany({
      where: { userId: req.user.id, lovedOneId },
      orderBy: { createdAt: 'desc' },
      take: memoryLimit,
    });

    const summaries = await prisma.memorySummary.findMany({
      where: { lovedOneId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const memoryLines = recentConversations
      .slice()
      .reverse()
      .map((c) => `${req.user.name}: ${c.userMessage}\n${lovedOne.name}: ${c.aiResponse}`)
      .join('\n\n');

    const summaryBlock =
      summaries.length > 0
        ? `LONG-TERM MEMORY SUMMARIES:\n${summaries.map((s) => s.summaryText).join('\n---\n')}\n\n`
        : '';

    const memoryContext = summaryBlock + (memoryLines || 'No past conversations yet.');

    const lovedOneForPrompt = {
      ...lovedOne,
      deepeningStage: lovedOne.deepeningStage || deepeningStageFromCount(lovedOne.totalConversations),
    };

    const systemPrompt = buildSystemPrompt(lovedOneForPrompt, req.user, memoryContext);

    let wantsLong = mode === 'confidence' || detectConfidence(userMessage);
    if (mode === 'confidence') wantsLong = true;

    const maxTokens = wantsLong ? 900 : 300;
    const userTurn =
      wantsLong && mode === 'confidence'
        ? `${userMessage}\n\n(Respond in 6–8 sentences as a blessing / ఆశీర్వాదం in their voice, values, and belief in ${req.user.name}.)`
        : wantsLong && detectConfidence(userMessage)
          ? `${userMessage}\n\n(They are facing something significant — reply with a slightly longer warm blessing-style message in Telugu, still grounded in this persona.)`
          : userMessage;

    const aiResponse = await generateResponse(systemPrompt, userTurn, { maxTokens });

    let isConfidence = Boolean(mode === 'confidence' || detectConfidence(userMessage));

    let audioUrl = null;
    if (lovedOne.voiceId) {
      const audioBuffer = await voiceService.synthesize(aiResponse, lovedOne.voiceId);
      const fileName = `conversations/${req.user.id}/${lovedOneId}/${Date.now()}.mp3`;
      audioUrl = await uploadFile(audioBuffer, fileName, 'audio/mpeg');
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.id,
        lovedOneId,
        userMessage,
        aiResponse,
        audioUrl,
        isConfidence,
        topicTag: isConfidence ? 'confidence' : null,
      },
    });

    const newTotal = lovedOne.totalConversations + 1;
    const newStage = deepeningStageFromCount(newTotal);

    await prisma.lovedOne.update({
      where: { id: lovedOneId },
      data: {
        totalConversations: newTotal,
        deepeningStage: newStage,
      },
    });

    if (newTotal > 0 && newTotal % 20 === 0) {
      createSummaryForLovedOne(prisma, lovedOneId, req.user.id).catch((e) =>
        console.error('Memory summary job failed:', e)
      );
    }

    return res.json({
      userMessage,
      aiResponse,
      audioUrl,
      isConfidence,
      conversationId: conversation.id,
      subscriptionTier: req.user.subscriptionTier,
    });
  } catch (err) {
    console.error('Conversation send error:', err);
    return res.status(500).json({ error: 'Conversation failed', message: err.message });
  }
});

router.get('/history/:lovedOneId', async (req, res) => {
  try {
    const { lovedOneId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const defaultLimit = 20;
    const limit = Math.min(parseInt(req.query.limit) || defaultLimit, 50);
    const skip = (page - 1) * limit;

    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: lovedOneId, userId: req.user.id },
    });

    if (!lovedOne) {
      return res.status(404).json({ error: 'Loved one not found' });
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: req.user.id, lovedOneId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversation.count({
        where: { userId: req.user.id, lovedOneId },
      }),
    ]);

    return res.json({
      conversations,
      subscriptionTier: req.user.subscriptionTier,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('Conversation history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history', message: err.message });
  }
});

module.exports = router;
