# Swara (స్వర) — The Voice That Never Left

Telugu-first voice AI app. Speak with an AI version of your most loved person in their cloned voice.

**Product spec:** [PRD.md](./PRD.md) (vision, MVP, legal, architecture, backlog). **Screen copy:** [SCREEN_CONTENT.md](./SCREEN_CONTENT.md) (all user-visible text per screen for UX edits).

## Project Structure

```
swara/
├── PRD.md            Consolidated product requirements (living document)
├── swara-backend/    Node.js + Express + Prisma + PostgreSQL
└── swara-app/        React Native (Expo) — Android first
```

---

## Quick Start

### 1. Backend

Docker Desktop must be running for the bundled Postgres. From `swara-backend`:

```bash
cd swara-backend
npm install
cp .env.example .env

# Postgres on host port 5434 (avoids clashing with anything on 5433)
npm run db:up
npm run db:push
npm run db:generate

npm run dev
```

If port 3000 is busy, stop the other process or set `PORT=3001` in `.env` and point the app at that port (`EXPO_PUBLIC_API_URL` or `API_URL`).

### 2. App

```bash
cd swara-app

# Install dependencies
npm install

# Start Expo
npx expo start --android
```

Android emulator uses `http://10.0.2.2:3000`; iOS simulator and web use `http://localhost:3000`. For a physical device, set `EXPO_PUBLIC_API_URL` (see `src/utils/constants.js`).

---

## Environment Variables (swara-backend/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `ANTHROPIC_API_KEY` | Claude API key |
| `ELEVENLABS_API_KEY` | ElevenLabs voice clone + TTS |
| `OPENAI_API_KEY` | Whisper speech-to-text |
| `AWS_ACCESS_KEY_ID` | S3 audio storage (optional in dev) |
| `AWS_SECRET_ACCESS_KEY` | S3 audio storage (optional in dev) |
| `AWS_BUCKET_NAME` | S3 bucket name |
| `AWS_REGION` | e.g. `ap-south-1` |

> In dev, if AWS keys are absent, audio files are saved locally to `swara-backend/uploads/`.

---

## API Summary

```
POST /api/auth/register
POST /api/auth/login

POST /api/loved-one/create
GET  /api/loved-one/list
GET  /api/loved-one/:id
POST /api/loved-one/:id/upload-voice

POST /api/conversation/send          ← core voice turn
GET  /api/conversation/history/:lovedOneId

POST /api/blessing/save
GET  /api/blessing/list
```

---

## Conversation Flow

```
User holds mic → .m4a recorded
  ↓ multipart POST /api/conversation/send
Whisper API → Telugu transcription
  ↓
Last 10 conversations fetched (memory context)
  ↓
Claude claude-sonnet-4-6 → Telugu response (≤300 tokens)
  ↓
ElevenLabs TTS (cloned voice) → audio buffer
  ↓
S3 upload → audioUrl
  ↓
Saved to PostgreSQL → response returned to app
  ↓
Audio plays in app   [target: <5s round-trip on 4G]
```

---

## Week 1 Checklist (before writing app code)

- [ ] Write 10 Telugu grandfather-grandchild conversations manually
- [ ] Test Claude system prompt with 3 real Telugu speakers
- [ ] Validate emotional resonance before building UI
