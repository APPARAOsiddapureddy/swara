# Swara Backend

Production-ready REST API for Swara — a Telugu-first voice AI app where users speak to an AI version of their most loved person, who responds in that person's cloned voice.

## Tech Stack

- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT authentication
- Claude API (claude-sonnet-4-6) for AI responses
- ElevenLabs for voice cloning + TTS
- OpenAI Whisper for speech-to-text (Telugu)
- AWS S3 / Cloudflare R2 for audio storage (local fallback in dev)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your API keys and database URL
```

### 3. Set up the database

```bash
npm run db:push       # Push schema to DB (dev)
npm run db:generate   # Generate Prisma client
```

### 4. Run the server

```bash
npm run dev    # Development (hot reload)
npm start      # Production
```

## API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ name, phone, password }` | Register new user |
| POST | `/api/auth/login` | `{ phone, password }` | Login, get JWT |

All other endpoints require `Authorization: Bearer <token>` header.

### Loved One

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/loved-one/create` | Create a new persona |
| GET | `/api/loved-one/list` | List all your loved ones |
| GET | `/api/loved-one/:id` | Get a single loved one |
| POST | `/api/loved-one/:id/upload-voice` | Upload voice sample for cloning |

#### Create Loved One Body

```json
{
  "name": "Thatha",
  "relation": "grandfather",
  "nickname": "Chinna",
  "dialect": "Rayalaseema",
  "values": ["hard work", "family", "honesty"],
  "supportStyle": "warm and encouraging with proverbs",
  "phrases": ["Nuvvu cheyagalavu, naaku telusu", "Meeru ilanti vaallu chaalaa takkuva"],
  "beliefText": "becoming a great engineer and making our family proud",
  "memoryText": "He used to take me to the fields every morning and tell stories about our ancestors"
}
```

#### Upload Voice (multipart/form-data)

- Field: `audio` — MP3/WAV/M4A file (max 50 MB)
- This uploads to S3 and calls ElevenLabs to create a voice clone
- The `voiceId` is saved on the LovedOne record

### Conversation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/conversation/send` | Send audio, get AI response |
| GET | `/api/conversation/history/:lovedOneId` | Paginated history |

#### Send Conversation (multipart/form-data)

- Field: `audio` — MP3/WAV (max 25 MB, Whisper limit)
- Field: `lovedOneId` — string

#### Response

```json
{
  "userMessage": "నేను రేపు ఇంటర్వ్యూ ఉంది, భయంగా ఉంది",
  "aiResponse": "చిన్నా, నువ్వు చేయగలవు...",
  "audioUrl": "https://...",
  "isConfidence": true,
  "conversationId": "clx..."
}
```

### Blessing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blessing/save` | Save a blessed message |
| GET | `/api/blessing/list` | List all blessings |

## Confidence Mode

When a user's message contains keywords related to high-stakes moments (interview, exam, launch, etc. — both in Telugu and English), `isConfidence` is set to `true` and Claude is prompted to deliver a longer, blessing-style response.

Telugu keywords detected: పరీక్ష, ఇంటర్వ్యూ, మీటింగ్, నిర్ణయం, పోటీ, సవాల్, and more.

## Storage

- If `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_BUCKET_NAME` are set: files are stored in S3
- Otherwise: files are saved locally to `/uploads/` and served at `http://localhost:3000/uploads/`
- For Cloudflare R2: set `AWS_PUBLIC_URL` to your R2 public domain

## Environment Variables

See `.env.example` for the full list.
