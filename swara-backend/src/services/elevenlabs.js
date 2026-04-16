const axios = require('axios');
const FormData = require('form-data');

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

/**
 * Clone a voice using ElevenLabs Voice Lab API.
 * @param {object} params
 * @param {string} params.name - Name for the cloned voice
 * @param {string} params.description - Description of the voice
 * @param {Buffer} params.audioBuffer - Audio file buffer
 * @param {string} params.originalName - Original filename
 * @param {string} params.mimetype - MIME type of the audio
 * @returns {Promise<string>} - The ElevenLabs voiceId
 */
const cloneVoice = async ({ name, description, audioBuffer, originalName, mimetype }) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set');
    }

    const form = new FormData();
    form.append('name', name);
    form.append('description', description || '');
    form.append('files', audioBuffer, {
      filename: originalName || 'voice-sample.mp3',
      contentType: mimetype || 'audio/mpeg',
    });

    const response = await axios.post(`${ELEVENLABS_BASE}/voices/add`, form, {
      headers: {
        'xi-api-key': apiKey,
        ...form.getHeaders(),
      },
      timeout: 60000,
    });

    if (!response.data || !response.data.voice_id) {
      throw new Error('No voice_id returned from ElevenLabs');
    }

    return response.data.voice_id;
  } catch (err) {
    if (err.response) {
      const message = err.response.data?.detail?.message || err.response.data?.detail || JSON.stringify(err.response.data);
      throw new Error(`ElevenLabs clone failed (${err.response.status}): ${message}`);
    }
    throw new Error(`ElevenLabs clone error: ${err.message}`);
  }
};

/**
 * Synthesize text to speech using a cloned ElevenLabs voice.
 * @param {string} text - Text to synthesize
 * @param {string} voiceId - ElevenLabs voice ID
 * @returns {Promise<Buffer>} - MP3 audio buffer
 */
const synthesizeSpeech = async (text, voiceId) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set');
    }

    if (!voiceId) {
      throw new Error('voiceId is required for TTS');
    }

    const response = await axios.post(
      `${ELEVENLABS_BASE}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );

    return Buffer.from(response.data);
  } catch (err) {
    if (err.response) {
      let message;
      try {
        // Response is arraybuffer, decode it
        const decoded = Buffer.from(err.response.data).toString('utf8');
        const parsed = JSON.parse(decoded);
        message = parsed?.detail?.message || parsed?.detail || decoded;
      } catch {
        message = `status ${err.response.status}`;
      }
      throw new Error(`ElevenLabs TTS failed: ${message}`);
    }
    throw new Error(`ElevenLabs TTS error: ${err.message}`);
  }
};

module.exports = { cloneVoice, synthesizeSpeech };
