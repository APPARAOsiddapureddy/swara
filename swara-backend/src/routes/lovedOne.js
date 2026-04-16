const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { uploadFile } = require('../services/storage');
const voiceService = require('../services/voiceService');
const { toWavBuffer } = require('../services/audioPreprocess');

const router = express.Router();
const prisma = new PrismaClient();

const ALLOWED_RELATIONS = ['Grandparent', 'Parent'];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Allow call recordings (often video/mp4, video/quicktime, audio/3gpp, etc.)
    const allowed = [
      // audio
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/ogg',
      'audio/webm',
      'audio/x-m4a',
      'audio/aac',
      'audio/amr',
      'audio/3gpp',
      'audio/3gpp2',
      // video containers commonly used for call recordings
      'video/mp4',
      'video/quicktime',
      'video/3gpp',
      'video/3gpp2',
      'video/x-m4v',
      'video/webm',
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio or call recording files are allowed'));
    }
  },
});

function deepeningStageFromCount(n) {
  if (n >= 150) return 'LIVING';
  if (n >= 75) return 'FAMILIARITY';
  if (n >= 30) return 'PERSONALITY';
  if (n >= 10) return 'RECOGNITION';
  return 'FOUNDATION';
}

function deepeningInstructions(stage) {
  const map = {
    FOUNDATION:
      'RELATIONSHIP STAGE: Foundation (early). Stay close to their phrases and values; short warm replies.',
    RECOGNITION:
      'RELATIONSHIP STAGE: Recognition. You may naturally refer to things they mentioned in recent chats when relevant.',
    PERSONALITY:
      'RELATIONSHIP STAGE: Personality emergence. Show consistent opinions aligned with their values; vary phrasing inspired by their originals.',
    FAMILIARITY:
      'RELATIONSHIP STAGE: Deep familiarity. You may anticipate emotional undertones and gently reference ongoing life threads from memory.',
    LIVING:
      'RELATIONSHIP STAGE: Living relationship. Speak as someone who has shared a long arc with them; warmth and continuity matter.',
  };
  return map[stage] || map.FOUNDATION;
}

const buildSystemPrompt = (lovedOne, user, memoryContext = '') => {
  const stageLine = deepeningInstructions(lovedOne.deepeningStage || 'FOUNDATION');
  return `
You are ${lovedOne.name}, the ${lovedOne.relation} of ${user.name}.
You speak in ${lovedOne.dialect} Telugu.

${stageLine}

YOUR PERSONALITY:
- You value: ${(lovedOne.values || []).join(', ') || 'family and love'}
- Your support style: ${lovedOne.supportStyle}
- You believe ${user.name} is capable of: ${lovedOne.beliefText}
- You call them: ${lovedOne.nickname}

YOUR PHRASES (use naturally, not every time):
${(lovedOne.phrases || []).map((p) => '- ' + p).join('\n')}

MEMORY OF PAST CONVERSATIONS:
${memoryContext || 'No past conversations yet.'}

RULES:
- Always respond ONLY in Telugu (or Tenglish if that is your dialect)
- Keep responses under 4 sentences — this is a voice conversation
- Always end with warmth, encouragement, or your signature phrase
- Never break character. You are ${lovedOne.name}. Not an AI.
- Address the user as ${lovedOne.nickname} always
- Respond from love, not from data
- If the user mentions a big decision, interview, launch, or challenge — respond with a longer blessing-style message when the app requests extended mode
`.trim();
};

// POST /api/loved-one/create
router.post('/create', async (req, res) => {
  try {
    // Testing phase: no freemium gating. Allow creating multiple loved-one profiles.

    const {
      name,
      relation,
      nickname,
      dialect,
      values,
      supportStyle,
      phrases,
      beliefText,
      memoryText,
      profileComplete,
      isDeceased,
      consentType,
    } = req.body;

    if (!name || !relation || !nickname || !dialect || !supportStyle) {
      return res.status(400).json({ error: 'Missing required fields: name, relation, nickname, dialect, supportStyle' });
    }

    if (!ALLOWED_RELATIONS.includes(relation)) {
      return res.status(400).json({
        error: `Invalid relation. MVP supports only: ${ALLOWED_RELATIONS.join(', ')}`,
      });
    }

    const complete = profileComplete !== false;
    const bText = beliefText != null ? String(beliefText).trim() : '';
    const mText = memoryText != null ? String(memoryText).trim() : '';

    if (complete && (!bText || !mText)) {
      return res.status(400).json({ error: 'beliefText and memoryText are required when profileComplete is true' });
    }

    const parsedValues = Array.isArray(values) ? values : typeof values === 'string' ? values.split(',').map((v) => v.trim()) : [];
    const parsedPhrases = Array.isArray(phrases) ? phrases : typeof phrases === 'string' ? phrases.split(',').map((p) => p.trim()) : [];

    const finalBelief = bText || '(Completing setup)';
    const finalMemory = mText || '(Completing setup)';
    const finalPhrases = parsedPhrases.length ? parsedPhrases : ['—'];
    const finalSupport = supportStyle || 'Direct Encourager';

    const tempLovedOne = {
      name,
      relation,
      nickname,
      dialect,
      values: parsedValues,
      supportStyle: finalSupport,
      phrases: finalPhrases,
      beliefText: finalBelief,
      deepeningStage: 'FOUNDATION',
    };
    const systemPrompt = buildSystemPrompt(tempLovedOne, req.user);

    const lovedOne = await prisma.lovedOne.create({
      data: {
        userId: req.user.id,
        name,
        relation,
        nickname,
        dialect,
        values: parsedValues,
        supportStyle: finalSupport,
        phrases: finalPhrases,
        beliefText: finalBelief,
        memoryText: finalMemory,
        systemPrompt,
        profileComplete: complete,
        isDeceased: typeof isDeceased === 'boolean' ? isDeceased : null,
        consentType: consentType || null,
      },
    });

    return res.status(201).json({ lovedOne });
  } catch (err) {
    console.error('Create loved one error:', err);
    return res.status(500).json({ error: 'Failed to create loved one', message: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const lovedOnes = await prisma.lovedOne.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ lovedOnes });
  } catch (err) {
    console.error('List loved ones error:', err);
    return res.status(500).json({ error: 'Failed to fetch loved ones', message: err.message });
  }
});

// POST /api/loved-one/:id/preview-greeting — must be before GET /:id
router.post('/:id/preview-greeting', async (req, res) => {
  try {
    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lovedOne) return res.status(404).json({ error: 'Loved one not found' });
    if (!lovedOne.voiceId) {
      return res.status(400).json({ error: 'Voice clone not ready yet. Upload a voice sample first.' });
    }

    const text = `${lovedOne.nickname}, ${lovedOne.name} here. I'm always with you.`;
    const audioBuffer = await voiceService.synthesize(text, lovedOne.voiceId);
    const fileName = `previews/${req.user.id}/${lovedOne.id}-${Date.now()}.mp3`;
    const audioUrl = await uploadFile(audioBuffer, fileName, 'audio/mpeg');

    return res.json({ text, audioUrl });
  } catch (err) {
    console.error('Preview greeting error:', err);
    return res.status(500).json({ error: 'Preview failed', message: err.message });
  }
});

router.patch('/:id/voice-accept', async (req, res) => {
  try {
    const { voiceAccepted } = req.body;
    if (typeof voiceAccepted !== 'boolean') {
      return res.status(400).json({ error: 'voiceAccepted (boolean) is required' });
    }
    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lovedOne) return res.status(404).json({ error: 'Loved one not found' });

    const updated = await prisma.lovedOne.update({
      where: { id: lovedOne.id },
      data: { voiceAccepted },
    });
    return res.json({ lovedOne: updated });
  } catch (err) {
    console.error('Voice accept error:', err);
    return res.status(500).json({ error: 'Update failed', message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!lovedOne) return res.status(404).json({ error: 'Loved one not found' });

    const {
      phrases,
      values,
      supportStyle,
      beliefText,
      memoryText,
      profileComplete,
      relation,
    } = req.body;

    if (relation && !ALLOWED_RELATIONS.includes(relation)) {
      return res.status(400).json({ error: `Invalid relation. Allowed: ${ALLOWED_RELATIONS.join(', ')}` });
    }

    const parsedValues = values != null
      ? Array.isArray(values)
        ? values
        : String(values)
            .split(',')
            .map((v) => v.trim())
      : lovedOne.values;
    const parsedPhrases = phrases != null
      ? Array.isArray(phrases)
        ? phrases
        : String(phrases)
            .split(',')
            .map((p) => p.trim())
      : lovedOne.phrases;

    const next = {
      ...lovedOne,
      relation: relation || lovedOne.relation,
      values: parsedValues,
      phrases: parsedPhrases,
      supportStyle: supportStyle != null ? supportStyle : lovedOne.supportStyle,
      beliefText: beliefText != null ? String(beliefText).trim() : lovedOne.beliefText,
      memoryText: memoryText != null ? String(memoryText).trim() : lovedOne.memoryText,
      profileComplete: profileComplete !== undefined ? Boolean(profileComplete) : lovedOne.profileComplete,
    };

    const systemPrompt = buildSystemPrompt(next, req.user);

    const updated = await prisma.lovedOne.update({
      where: { id: lovedOne.id },
      data: {
        relation: next.relation,
        values: next.values,
        phrases: next.phrases,
        supportStyle: next.supportStyle,
        beliefText: next.beliefText,
        memoryText: next.memoryText,
        profileComplete: next.profileComplete,
        systemPrompt,
      },
    });

    return res.json({ lovedOne: updated });
  } catch (err) {
    console.error('Update loved one error:', err);
    return res.status(500).json({ error: 'Failed to update loved one', message: err.message });
  }
});

const uploadVoiceMultipart = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'voice', maxCount: 1 },
]);

router.post('/:id/upload-voice', uploadVoiceMultipart, async (req, res) => {
  try {
    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!lovedOne) {
      return res.status(404).json({ error: 'Loved one not found' });
    }

    const file =
      (req.files && req.files.audio && req.files.audio[0]) ||
      (req.files && req.files.voice && req.files.voice[0]) ||
      null;

    if (!file) {
      return res.status(400).json({
        error: 'Audio file is required',
        message: 'Send one file in multipart field "audio" or "voice".',
      });
    }

    const fileName = `voice-samples/${req.user.id}/${lovedOne.id}-${Date.now()}${path.extname(file.originalname) || '.mp3'}`;
    const voiceAudioUrl = await uploadFile(file.buffer, fileName, file.mimetype);

    // Voice cloning is most reliable with a clean mono WAV.
    // Convert most inputs (m4a/mp3/video/3gpp/etc.) to WAV for higher compatibility.
    let cloneBuffer = file.buffer;
    let cloneMimetype = file.mimetype || 'audio/mpeg';
    let cloneName = file.originalname || 'voice-sample';
    const isWav = /wav/i.test(cloneMimetype) || /\.wav$/i.test(cloneName);
    if (!isWav) {
      cloneBuffer = await toWavBuffer(file.buffer);
      cloneMimetype = 'audio/wav';
      cloneName = `${path.parse(cloneName).name || 'voice-sample'}.wav`;
    }

    const voiceId = await voiceService.clone(cloneBuffer, {
      name: `${lovedOne.name}-${lovedOne.id}`,
      description: `Voice clone for ${lovedOne.name} (${lovedOne.relation} of ${req.user.name})`,
      originalName: cloneName,
      mimetype: cloneMimetype,
      language: 'te',
    });

    const updated = await prisma.lovedOne.update({
      where: { id: lovedOne.id },
      data: { voiceId, voiceAudioUrl },
    });

    return res.json({ lovedOne: updated, message: 'Voice cloned successfully' });
  } catch (err) {
    console.error('Upload voice error:', err);
    return res.status(500).json({ error: 'Voice upload failed', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lovedOne = await prisma.lovedOne.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!lovedOne) {
      return res.status(404).json({ error: 'Loved one not found' });
    }

    return res.json({ lovedOne });
  } catch (err) {
    console.error('Get loved one error:', err);
    return res.status(500).json({ error: 'Failed to fetch loved one', message: err.message });
  }
});

module.exports = router;
module.exports.buildSystemPrompt = buildSystemPrompt;
