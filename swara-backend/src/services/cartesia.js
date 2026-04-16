const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const CARTESIA_BASE = 'https://api.cartesia.ai';

function cartesiaVersion() {
  return process.env.CARTESIA_VERSION || '2026-03-01';
}

function cartesiaApiKey() {
  const key = process.env.CARTESIA_API_KEY;
  if (!key) throw new Error('CARTESIA_API_KEY is not set');
  return key;
}

function cartesiaModelId() {
  // Sonic-2 is broadly supported; sonic-3 adds more controls but may vary by account.
  return process.env.CARTESIA_MODEL_ID || 'sonic-2';
}

/**
 * Clone a high-similarity voice from an audio clip.
 * API: POST https://api.cartesia.ai/voices/clone (multipart/form-data)
 * @returns {Promise<string>} voiceId
 */
async function cloneVoice({ name, description, audioBuffer, originalName, mimetype, language }) {
  try {
    const form = new FormData();
    form.append('name', name);
    if (description) form.append('description', description);
    if (language) form.append('language', language);

    const safeName = originalName || `voice-sample${mimetype === 'audio/wav' ? '.wav' : '.mp3'}`;
    form.append('clip', audioBuffer, {
      filename: safeName,
      contentType: mimetype || 'audio/mpeg',
    });

    const response = await axios.post(`${CARTESIA_BASE}/voices/clone`, form, {
      headers: {
        Authorization: `Bearer ${cartesiaApiKey()}`,
        'Cartesia-Version': cartesiaVersion(),
        ...form.getHeaders(),
      },
      timeout: 90000,
    });

    if (!response.data || !response.data.id) {
      throw new Error('No id returned from Cartesia');
    }

    return response.data.id;
  } catch (err) {
    if (err.response) {
      const msg =
        err.response.data?.error?.message ||
        err.response.data?.message ||
        err.response.data?.detail ||
        JSON.stringify(err.response.data);
      throw new Error(`Cartesia clone failed (${err.response.status}): ${msg}`);
    }
    throw new Error(`Cartesia clone error: ${err.message}`);
  }
}

/**
 * Synthesize text to speech using a voice ID.
 * API: POST https://api.cartesia.ai/tts/bytes (application/json) -> audio bytes
 * Returns an MP3 buffer (to match the app's current expectation).
 * @returns {Promise<Buffer>}
 */
async function synthesizeSpeech(text, voiceId) {
  try {
    if (!voiceId) throw new Error('voiceId is required for TTS');

    const body = {
      model_id: cartesiaModelId(),
      transcript: text,
      voice: { mode: 'id', id: voiceId },
      output_format: {
        container: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000,
      },
    };

    const response = await axios.post(`${CARTESIA_BASE}/tts/bytes`, body, {
      headers: {
        Authorization: `Bearer ${cartesiaApiKey()}`,
        'Cartesia-Version': cartesiaVersion(),
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
      timeout: 90000,
    });

    return Buffer.from(response.data);
  } catch (err) {
    if (err.response) {
      let msg;
      try {
        const decoded = Buffer.from(err.response.data).toString('utf8');
        msg = decoded;
      } catch {
        msg = `status ${err.response.status}`;
      }
      throw new Error(`Cartesia TTS failed (${err.response.status}): ${msg}`);
    }
    throw new Error(`Cartesia TTS error: ${err.message}`);
  }
}

module.exports = { cloneVoice, synthesizeSpeech };

