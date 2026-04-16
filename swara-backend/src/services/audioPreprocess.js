const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Convert arbitrary audio/video container bytes into a clean WAV buffer.
 * This allows call recordings (mp4/mov/3gp etc.) to be used for cloning.
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<Buffer>}
 */
async function toWavBuffer(inputBuffer) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static is not available to preprocess audio');
  }
  if (!inputBuffer || !Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
    throw new Error('Invalid input audio buffer');
  }

  const tmpDir = os.tmpdir();
  const inPath = path.join(tmpDir, `swara-in-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
  const outPath = path.join(tmpDir, `swara-out-${Date.now()}-${Math.random().toString(16).slice(2)}.wav`);

  await fs.promises.writeFile(inPath, inputBuffer);

  try {
    await new Promise((resolve, reject) => {
      const args = [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        inPath,
        '-vn',
        '-ac',
        '1',
        // 16k mono PCM is broadly accepted and smaller than 44.1k
        '-ar',
        '16000',
        '-acodec',
        'pcm_s16le',
        outPath,
      ];

      const ff = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });

      const err = [];
      ff.stderr.on('data', (d) => err.push(d));
      ff.on('error', (e) => reject(new Error(`ffmpeg failed to start: ${e.message}`)));
      ff.on('close', (code) => {
        if (code !== 0) {
          const msg = Buffer.concat(err).toString('utf8') || `exit ${code}`;
          reject(new Error(`ffmpeg convert failed: ${msg}`));
          return;
        }
        resolve();
      });
    });

    const wav = await fs.promises.readFile(outPath);
    if (!wav.length) throw new Error('ffmpeg produced empty output');
    return wav;
  } finally {
    fs.promises.unlink(inPath).catch(() => {});
    fs.promises.unlink(outPath).catch(() => {});
  }
}

module.exports = { toWavBuffer };

