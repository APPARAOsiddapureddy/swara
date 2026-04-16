/**
 * Provider-agnostic voice API (PRD §5.5). Current adapter: ElevenLabs.
 * Route handlers must use this module — not call ElevenLabs directly.
 */
const elevenlabs = require('./elevenlabs');
const cartesia = require('./cartesia');

function providerName() {
  const explicit = (process.env.VOICE_PROVIDER || '').toLowerCase().trim();
  if (explicit) return explicit;
  if (process.env.CARTESIA_API_KEY) return 'cartesia';
  return 'elevenlabs';
}

function provider() {
  const name = providerName();
  if (name === 'cartesia') return cartesia;
  return elevenlabs;
}

/**
 * @param {Buffer} audioBuffer
 * @param {{ name: string, description?: string, originalName?: string, mimetype?: string, language?: string }} config
 * @returns {Promise<string>} voiceId
 */
async function clone(audioBuffer, config) {
  const impl = provider();
  return impl.cloneVoice({
    name: config.name,
    description: config.description || '',
    audioBuffer,
    originalName: config.originalName || 'voice-sample.mp3',
    mimetype: config.mimetype || 'audio/mpeg',
    language: config.language,
  });
}

/**
 * @param {string} text
 * @param {string} voiceId
 * @returns {Promise<Buffer>}
 */
async function synthesize(text, voiceId) {
  const impl = provider();
  return impl.synthesizeSpeech(text, voiceId);
}

module.exports = { clone, synthesize };
