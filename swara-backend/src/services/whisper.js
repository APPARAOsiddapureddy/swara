const { OpenAI } = require('openai');
const path = require('path');

/**
 * Transcribe audio using OpenAI Whisper with Telugu language hint.
 * @param {Buffer} audioBuffer - The audio file buffer
 * @param {string} originalName - Original filename (used for extension detection)
 * @param {string} mimetype - MIME type of the audio
 * @returns {Promise<string>} - Transcribed text
 */
const transcribeAudio = async (audioBuffer, originalName, mimetype) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({ apiKey });

    // Determine file extension for Whisper
    let ext = path.extname(originalName || '').toLowerCase();
    if (!ext) {
      // Infer from mimetype
      const mimeToExt = {
        'audio/mpeg': '.mp3',
        'audio/mp3': '.mp3',
        'audio/wav': '.wav',
        'audio/wave': '.wav',
        'audio/webm': '.webm',
        'audio/ogg': '.ogg',
        'audio/mp4': '.mp4',
        'audio/x-m4a': '.m4a',
        'audio/m4a': '.m4a',
      };
      ext = mimeToExt[mimetype] || '.mp3';
    }

    const fileName = `audio${ext}`;

    // OpenAI SDK expects a File-like object with a name property
    // Convert Buffer to a Blob-compatible object
    const file = new File([audioBuffer], fileName, { type: mimetype || 'audio/mpeg' });

    const languageHint = (process.env.OPENAI_TRANSCRIBE_LANGUAGE || '').trim();
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      // Avoid forcing a language hint — OpenAI can auto-detect reliably and
      // some accounts/models reject certain language codes.
      ...(languageHint ? { language: languageHint } : {}),
      response_format: 'text',
    });

    return typeof transcription === 'string' ? transcription.trim() : transcription.text?.trim() || '';
  } catch (err) {
    if (err.status) {
      throw new Error(`Whisper API failed (${err.status}): ${err.message}`);
    }
    throw new Error(`Whisper transcription error: ${err.message}`);
  }
};

module.exports = { transcribeAudio };
