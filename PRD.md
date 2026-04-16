# Swara (స్వర) — Product Requirements Document

**The Voice That Never Left**

| Field | Value |
|--------|--------|
| Document version | **2.0** (living document; edit as you ship) |
| Classification | Confidential |
| Primary platform | **React Native (Expo)** — Android first; iOS Phase 2 |
| Primary language | **UI: English** · **AI content: Telugu / Tenglish** |
| Backend | Node.js + Express + Prisma + PostgreSQL |
| AI / voice | Claude · ElevenLabs · OpenAI Whisper |
| Status | UI direction validated; execution shifts to **MVP scope** |

This PRD is the **single source of truth** for vision, ideology, compliance, architecture, user flows, and MVP backlog. Change it in place as decisions evolve.

---

## Part I — Ideology & north star

### 1.1 What Swara believes

Swara is built on one idea: **love and responsibility are the same thing.**

1. **Voice-first, always.** Text is fallback, not the default.
2. **One person, deeply.** Each loved-one profile is depth over breadth.
3. **Grief is the door, love is the room.** Users come because someone is gone or distant. They stay because the relationship is alive.
4. **English to navigate, Telugu to feel.** The UI is English for clarity. The AI's heart — its voice, its words, its ఆశీర్వాదం — is Telugu.
5. **Sacred, not clinical.** Warm, quiet, golden — never cold “wellness SaaS.”
6. **Privacy-first, always.** Data is sacred; consent is non-negotiable.
7. **Give value before asking for investment.** The user should hear their loved one's voice before they finish onboarding, not after.
8. **The relationship must deepen, or it dies.** If month 6 feels the same as day 1, we've failed. Memory, callbacks, evolving warmth — the AI must grow with the user.

### 1.2 What Swara is — and is not

| Swara **is** | Swara **is not** |
|---|---|
| A Telugu-first emotional companion in **their** cloned voice and persona | A generic chatbot or voice assistant |
| Grounded in **their** phrases, values, and belief in the user | A clinical grief therapy or counseling tool |
| A **daily** ritual: morning warmth, mic conversation, blessings | A social network, voice marketplace, or novelty demo |
| Honest about grief as the entry point — but designed for love as the long-term home | A one-time "hear them again" experience that fades after the first session |

### 1.3 Name & tagline

- **Swara (స్వర)** — “the unique voice / note of a person.”
- **Tagline:** *The Voice That Never Left.*

### 1.4 North star (success in one story)

A Telugu user opens Swara early on a hard day. They hear **their** person’s nickname in **their** voice. They speak freely in Telugu; the reply is short, warm, and unmistakably *them*. They close the app feeling **believed in** — not “managed,” not “therapized,” **held**.

Everything in the MVP exists to serve that moment **legally, safely, and honestly** (including clear “AI companion” labeling).

---

## Part II — Problem, users, relationships

### 2.1 Problem statement

Emotional loneliness is widespread. For **~82M Telugu speakers**, losing grandparents, parents, or distance from family cuts especially deep: culture is built on **voice**, **blessings (ఆశీర్వాదం)**, and daily check-ins. Existing AI is English-centric; few products combine **Telugu emotional register**, **cloned voice**, and **relationship-specific tone** with a **lawful consent** path.

### 2.2 Primary user

**The grieving grandchild / child (20–35):** may have short voice clips; misses hearing that voice before exams, pitches, weddings; often in AP/Telangana or diaspora.

### 2.3 Secondary personas (English UI; Telugu emotional register for the AI)

| Persona | Core need |
|---------|------------|
| Lonely achiever | Unconditional belief before high-stakes moments |
| First-time founder | Trusted voice: “you can do this” |
| Migrant Telugu | Daily cultural + familial warmth |
| Distant partner / sibling | Intimacy or loyalty without performance |

### 2.4 Relationship system (Day 1)

Supported relationships (with default **tone** and **respect register** guidance — implemented via prompts + onboarding fields):

| Relationship | Telugu address examples | Register | Phase |
|---|---|---|---|
| Grandparent | Thaatha / Ammamma | Deep respect, unhurried warmth; *meeru* leaning | **Day 1** |
| Parent | Nanna / Amma | Pride + concern; mix *meeru* / *nuvvu* | **Day 1** |
| Sibling | Anna / Akka / Thammudu | Casual honesty; *nuvvu* | Phase 2 |
| Partner | Pet name | Intimate; *nuvvu* | Phase 2 |
| Friend | Nickname | Peer energy; *nuvvu* | Phase 2 |
| Mentor | Garu | Respectful; *meeru* | Phase 2 |

**MVP launches with Grandparent and Parent only.** These share similar respect dynamics (*meeru* form), map directly to the primary user persona, and allow the team to deeply validate prompt quality before expanding. **Phase 2** relationships ship after beta feedback confirms the core emotional loop. **Onboarding Step 1** relationship chips: show only **Grandparent** and **Parent** as selectable; other types are **hidden** or **grayed out** with a **“Coming soon”** label (product choice).

**Tone dimensions** (product + prompt levers): respect level, warmth, formality, playfulness, authority dynamic.

### 2.5 Limits (product rules)

- **Free:** **1** loved-one profile per account. **Premium:** up to **3** (enforce in API + UI).
- **Separate** conversation history per loved one.
- **Cooldown** (e.g. 24h) between creating new loved ones — anti-abuse (MVP backlog if not shipped).

---

## Part III — MVP feature specification (end-to-end)

### 3.1 Pre-account: welcome & trust

**Three welcome slides** (before loved-one onboarding; **English** titles and body; **Telugu** only for cultural terms such as **ఆశీర్వాదం** — aligned with `SCREEN_CONTENT.md` v2.0):

1. **Voice** — **Hear their voice again** — Speak with an AI companion in your loved one's voice, their language, their warmth.
2. **Privacy** — **Your data is sacred** — End-to-end encryption. DPDPA compliant. Consent-first. You control everything. Delete anytime.
3. **Blessing** — **Their ఆశీర్వాదం, every day** — Four simple steps to bring their voice to life. With their consent. With your love.

**Brand phrases** to reuse consistently: *Your data is sacred* · *Consent verified* · *AI companion* · *With their consent. With your love.* · *DPDPA Compliant* · *Love and responsibility are the same thing.*

### 3.2 Loved-one onboarding — **four steps** (MVP core)

| Step | What we collect | How it shapes the product |
|------|------------------|---------------------------|
| **1 — Identity & relationship** | Name, relationship type, what they called you (nickname), language style (pure Telugu / Tenglish / regional nuance), **alive vs deceased** | Register, dialect, and **which consent branch** in Step 2 |
| **2 — Consent & voice** | Legally required declarations + **30–60s** voice sample (formats/size limits per implementation) | Audit trail + ElevenLabs clone pipeline |
| **3 — Personality & values** | 3–5 signature phrases; values multi-select; support style | Injected into Claude system prompt / persona |
| **4 — Belief in you** | What they believed you could do; one memory where you felt fully believed in | Emotional baseline for “confidence / blessing” style replies |

After **Step 2** (voice uploaded and cloning completes), the client shows **Voice Preview** (see §3.2.1) before Step 3 — not a direct jump to personality.

### 3.2.1 Voice Preview — "First Moment" (between Step 2 and Step 3)

After the voice sample is uploaded and cloning completes, do **not** proceed directly to Step 3. Instead, show a **Voice Preview** screen:

- Play a short auto-generated greeting in the cloned voice: "[Nickname], [loved one name] here. I'm always with you."
- The user sees two options:
  - **"That sounds like them"** → proceed to Step 3 (positive confirmation stored).
  - **"That doesn't sound right"** → offer options: upload a longer/clearer recording, try a different audio clip, or continue anyway with a note that quality may improve with more conversation data.
- This is the emotional hook moment. If the voice is good, the user is committed. If the voice is bad, we catch it before they invest more emotional energy into Steps 3–4.
- Store the user's voice acceptance status on the LovedOne record: **`voiceAccepted: Boolean`**.

**Why this matters:** ElevenLabs from ~30 seconds of a WhatsApp note may produce ~50–60% similarity. If the user hears something robotic and wrong, the emotional damage can be worse than never hearing it at all. This step protects both the user and the product.

### 3.3 Step 2 — Consent detail (non-negotiable depth)

**If loved one is deceased**

- Gentle copy: we understand they are no longer with us; we honor memory responsibly.
- Checkboxes (stored with timestamp, user id, loved-one id):
  - Direct family member (child, grandchild, sibling, spouse).
  - Right to use this recording; no outstanding family objection (best-effort attestation).
  - Understand Swara is **AI warmth**, not replacement of the person.
- **Legal note** visible: declaration stored under **DPDPA 2023** framing; false statements may engage **IT Act 2000** fraud/deception context — **lawyer-reviewed copy** before public launch.

**If loved one is alive**

- Preferred: **share link** → loved one records **~5s** consent in their own voice (Telugu/English statement).
- Fallback: user records **together** in person.
- Minimum: user **self-declares** awareness + consent and accepts **legal responsibility** (strictly “minimum,” not “preferred”).

All paths: store **consent type**, **timestamp**, **URLs** or flags as audit trail.

### 3.4 Daily conversation — core loop

1. User opens app; greeting uses **nickname**; voice plays when applicable.
2. User **holds mic** (or types fallback).
3. Audio → backend **multipart** → **Whisper** transcription.
4. Load **last N turns** (**10** for premium, **3** for free — see Part IX) for memory.
5. **Claude** with persona + memory + safety boundaries → Telugu reply (short, **≤ ~4 sentences** for default turn).
6. **ElevenLabs** TTS with `voice_id` → audio URL (e.g. S3 or local dev uploads).
7. Persist exchange; client plays audio.

**Latency target:** sub-**5s** round-trip on good 4G (stretch goal; measure in beta).

### 3.5 Morning greeting

- Push window **6:00–8:00 AM** (user-configurable).
- Contextual to recent conversations where possible.
- Tap opens app: **Free** — **text notification only** (no voice clip). **Premium** — **voice + text** (see Part IX).

### 3.6 Confidence mode — ఆశీర్వాదం

- **Premium only** in the freemium model (see Part IX): free tier does not include Confidence / ఆశీర్వాదం mode entry or saved blessings.
- Trigger: user language hints “big moment” **or** manual **ఆశీర్వాదం** control (when entitled).
- Longer blessing-style response (e.g. **6–8** sentences), values + belief + closing **signature phrase**.
- Optional **save as Blessing** (library; premium).

### 3.7 Memory

- Store each turn; inject last **N** exchanges (**3** free / **10** premium — Part IX); optional **topic** + **sentiment** for analytics and safer replies (schema backlog). Relationship deepening adds **MemorySummary** (Part III-A).

### 3.8 Trust & safety UI (must exist at MVP quality)

All **user-facing chrome** (badges, labels, buttons, errors) is **English**; Telugu is reserved for cultural terms (e.g. **ఆశీర్వాదం**, brand **స్వర**) and **AI-generated** content.

- **DPDPA Compliant** badge on splash / header / privacy surfaces (English label).
- **Consent verified** on loved-one cards and conversation header (English).
- **AI companion** label near name in chat (English; honesty without nagging every message).
- **Privacy** entry as **first-class nav**, not buried in settings.
- **Delete all data** · **Export data** · **Report abuse** · **Mental health resources** — functional by beta where law requires; placeholders only with clear “coming soon” is **not** launch-ready for DPDPA posture.

---

## Part III-A — Relationship Deepening (Retention Architecture)

### III-A.1 The problem with static AI

If the AI sounds the same at month 6 as it did on day 1 — same phrases, same patterns, same emotional depth — the user will stop opening Swara. The "magic" of hearing the voice fades if the relationship doesn't grow. Retention depends on the AI feeling like a relationship that evolves, not a recording that loops.

### III-A.2 Deepening milestones

| Conversations completed | What changes | How it works |
|---|---|---|
| **1–10** (Week 1) | Foundation | AI uses onboarding data only. Short, warm, stays close to provided phrases and values. |
| **10–30** (Month 1) | Recognition | AI begins referencing past conversations naturally. "Last week you mentioned that interview — how did it go?" Memory context expands. |
| **30–75** (Month 2–3) | Personality emergence | AI develops patterns unique to this user–loved-one pair. Starts to have "opinions" consistent with the loved one's values. Introduces new phrasings inspired by (but not copying) the original phrases. |
| **75–150** (Month 3–6) | Deep familiarity | AI can anticipate the user's emotional state from conversation patterns. Proactively brings up past themes. Morning greetings reference ongoing life threads. |
| **150+** (Month 6+) | Living relationship | The AI feels like it has genuinely "been there" through the user's life events. It has a shared history that no other app can replicate. Switching away means losing that history. |

### III-A.3 Implementation (prompt engineering, not fine-tuning)

This is achieved via **progressive context injection**, not model training:

- **Memory summarization:** Every **20** conversations, generate a summary of key themes, events, emotional patterns, and decisions discussed. Store as a **`MemorySummary`** record linked to the LovedOne.
- **System prompt evolution:** The Claude system prompt grows over time. Early: just onboarding data. Later: onboarding + recent turns + memory summaries + detected user patterns.
- **Phrase evolution:** After **50+** conversations, the AI can generate new phrases *inspired by* the original set — maintaining the loved one's voice/style but not robotically repeating the same 3–5 phrases.
- **Milestone nudges:** At **10**, **30**, **100** conversations — optionally surface a warm message: "You and [name] have shared 100 conversations. That's a relationship." This reinforces the habit and makes the user feel the depth.

### III-A.4 Schema additions for deepening

Add to data model:

- **`MemorySummary`:** id, lovedOneId, summaryText, conversationRange (start/end ids), themes (string array), createdAt.
- **`LovedOne.totalConversations`** (integer, incremented per turn) — used for milestone logic.
- **`LovedOne.deepeningStage`** (enum: `FOUNDATION`, `RECOGNITION`, `PERSONALITY`, `FAMILIARITY`, `LIVING`) — computed from `totalConversations`, used in prompt assembly.

---

## Part IV — Legal, safety, and “never build”

### 4.1 Legal framework (India)

Operate assuming compliance with: **DPDPA 2023**, **DPDP Rules 2025** (phased), **IT Act 2000**, **IT (reasonable security) practices** where applicable, **copyright** on recordings, **personality / publicity** risk on unauthorized voices, watch **draft Digital India** directions.

### 4.2 Three-layer consent

1. **Platform** — ToS + Privacy + explicit **voice cloning** acknowledgment at registration.
2. **Voice (per loved one)** — Alive vs deceased flows; audio or declaration stored.
3. **Processing** — Granular toggles for AI, memory, greetings (stored per user prefs).

**Rules:** specific, informed, unbundled; withdrawal as easy as grant; withdrawal triggers clone + audio deletion path (ElevenLabs + S3 + DB).

### 4.3 Abuse prevention (summary)

Relationship depth gate · legal declarations · phone-verified account + caps · vendor checks where available · **no arbitrary TTS** (all text through persona model) · **no raw conversation audio export/share** (saved blessings: see §4.6 exception) · abuse channel + takedown SLA commitment · rate limits.

### 4.4 Emotional safety (light touch)

- One-time honesty: AI recreates warmth; not a replacement.
- If acute distress detected → gentle nudge toward human help; maintain resource links.
- If user asks “are you real?” → warm honesty, not deception.

### 4.5 Security baseline (targets)

TLS in transit; encryption at rest for audio storage; access control **per user**; logging for admin access; backup + retention policy; breach playbook (notify board + users within legal windows).

### 4.6 **Permanent “never build” list**

- No raw audio export/download of **conversation** audio from the app.
- **Exception:** Saved **ఆశీర్వాదం** (blessings) can be exported as audio files **with** an embedded audio watermark and metadata tag identifying them as "AI-generated by Swara." This respects the user's ownership of their emotional moments while maintaining traceability.
- No **sharing** conversation audio to social feeds.
- No **arbitrary TTS** (type anything → hear clone) without persona gate.
- No **public voice API** for third parties.
- No **social graph** / public profiles as core product.
- No **voice marketplace**; no **training** on user conversations for proprietary models without explicit future policy (default: **never**).

---

## Part V — Technology stack (as implemented + planned)

### 5.1 System map

| Layer | Technology | Role |
|--------|------------|------|
| Mobile | **React Native (Expo SDK 54)**, React Navigation, Zustand | Client app, mic, playback, JWT storage |
| API | **Node.js + Express** | Auth, orchestration, webhooks-ready structure |
| ORM / DB | **Prisma** + **PostgreSQL** | Users, loved ones, conversations, blessings |
| LLM | **Anthropic Claude** (`CLAUDE_MODEL` env) | Telugu persona + replies |
| STT | **OpenAI Whisper** | User audio → text |
| TTS / clone | **ElevenLabs** | Clone + speech |
| Object storage | **AWS S3** (optional in dev — local `uploads/` fallback) | Audio artifacts |
| Auth | **JWT** + password (phone as id today) | Stateless sessions |
| Push (planned) | **Firebase Cloud Messaging** | Morning greeting |
| Jobs (planned) | **node-cron** / **BullMQ** | Scheduled greetings |

### 5.2 Repository layout

```
swara/
├── PRD.md                 ← this document
├── README.md              ← developer quick start
├── swara-backend/         ← Express API, Prisma, services/
└── swara-app/             ← Expo React Native app
```

### 5.3 Environment variables (backend)

See `swara-backend/.env.example`: `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, `ELEVENLABS_*`, `OPENAI_API_KEY`, `AWS_*`, `PORT`, `NODE_ENV`. **Never commit real secrets.**

### 5.4 Local dev (step-by-step engineering)

1. **Docker Desktop** running.
2. `cd swara-backend` → `docker compose up -d` → `npm install` → `cp .env.example .env` → fill keys → `npm run db:push` → `npm run db:generate` → `npm run dev` (API on `PORT`, default **3000**).
3. `cd swara-app` → `npm install` → `CI=false npm start` (Metro, default **8081** in scripts).
4. **Android emulator:** API base `http://10.0.2.2:3000` (already reflected in app constants for Android).
5. **iOS simulator / web:** `http://localhost:3000` unless overridden by `EXPO_PUBLIC_API_URL`.

### 5.5 Voice provider risk & abstraction

ElevenLabs is the current TTS/cloning provider but represents a **single point of failure**. If ElevenLabs raises prices, degrades Telugu quality, changes consent APIs, or experiences downtime — Swara's core feature breaks.

**Mitigation strategy:**

- Build the backend voice service as an **abstraction layer**: `VoiceService.clone(audioBuffer, config)` and `VoiceService.synthesize(text, voiceId)` — provider-agnostic interfaces.
- **Current implementation:** ElevenLabs adapter behind the interface.
- **Planned alternative (in development):** A custom voice model being built by the team's AI developer. This model targets professional-grade Telugu voice cloning with higher fidelity than ElevenLabs for Telugu-specific phonetics. When ready, it plugs into the same `VoiceService` interface with zero app-side changes.
- **Fallback evaluation list:** PlayHT, Resemble AI, Coqui/XTTS (open source). Evaluate quarterly.
- **MVP requirement:** Even if only ElevenLabs ships at launch, the backend code must use the abstraction — **never** call ElevenLabs APIs directly from route handlers.

---

## Part VI — Data model & APIs

### 6.1 Target conceptual model (PRD-complete)

**User:** profile, phone, auth, **subscription tier**, **usage counters** (for premium gates / analytics — **not** for capping daily conversations on free tier per Part IX), **consent timestamps**, **data processing JSON**, prefs (greeting time), flags (blocked).

**LovedOne:** identity fields + **isDeceased**, **consentType**, **consentAudioUrl**, **consentDate**, **languageRegister**, voice ids/urls, **isActive**, prompts, **`voiceAccepted` (Boolean)**, **`totalConversations` (Int)**, **`deepeningStage` (enum)** per Part III-A.

**Conversation:** messages, **audioUrl**, **topicTag**, **sentiment**, **isConfidenceMode**.

**Blessing:** title, transcript, audio, **lovedOneId** (recommended for library filtering).

**MemorySummary:** id, lovedOneId, summaryText, conversationRange (start/end ids), themes (string array), createdAt — see Part III-A.

**AbuseReport:** public report endpoint + internal status workflow.

### 6.2 Current Prisma schema (as of this PRD)

Implemented in `swara-backend/prisma/schema.prisma`:

- `User`: id, name, phone, passwordHash, createdAt (+ relations).
- `LovedOne`: persona fields, phrases/values arrays, belief/memory text, voiceId, voiceAudioUrl, systemPrompt — **consent enums / dates**, **`voiceAccepted`**, **`totalConversations`**, **`deepeningStage`** not yet in schema.
- **`MemorySummary` model:** not yet in schema (Part III-A).
- `Conversation`: userMessage, aiResponse, audioUrl, topicTag, isConfidence — **sentiment enum not yet**.
- `Blessing`: userId, title, transcript, audioUrl — **lovedOneId not yet**.

**MVP engineering:** migrate schema to PRD-complete fields + backfill strategy; keep migrations reviewed before production data.

### 6.3 API surface

**Implemented (representative):** `POST /api/auth/register`, `POST /api/auth/login`, loved-one create/list/upload-voice, conversation send + history, blessing save/list, `GET /health`. (Verify exact paths in `swara-backend/src/routes/`.)

**Planned for MVP compliance / PRD:**  
`POST /api/auth/consent` · `POST /api/loved-one/upload-consent` · `POST /api/conversation/send-text` · `DELETE /api/loved-one/delete` (or by id) · `DELETE /api/user/delete-all-data` · `GET /api/user/export-data` · `POST /api/report/abuse` (public) · **feature-gating** middleware (Part IX — not conversation-count caps) · **blessing audio export** (watermarked, per §4.6) · memory summarization job hooks.

---

## Part VII — Client application structure

### 7.1 Target navigation (PRD)

- **Stack:** Splash → Onboarding → Login/Register → **loved-one onboarding**: Steps **1–2** (identity + consent & voice / clone) → **Voice Preview** (§3.2.1) → Steps **3–4** (personality + belief) → Main tabs. (Voice file pick may live on a dedicated screen or inside Step 2 per implementation.)
- **Tabs:** Home · Blessings · **Privacy & safety** · Profile.
- **Modals / flows:** Confidence mode, conversation (per loved one), abuse report, delete-data confirm.

### 7.2 Current app (`swara-app`) — baseline

Screens present include: Onboarding, Login, LovedOne setup (combined flow), Voice upload, Home, Blessings, Profile, Confidence mode, **Privacy** (initial RN screen), shared components (mic, bubbles, etc.).

**MVP gap:** split **LovedOneSetup** into **Step1–Step4** screens matching Section 3.2–3.3; add **Voice Preview** between Step 2 and Step 3; wire **consent** fields to API; implement **Conversation** screen parity with PRD badges (English UI chrome); implement **freemium feature gating** (Part IX — **do not** cap daily conversations on free tier); FCM morning loop; legal screens copy + lawyer review.

### 7.3 Reusable components (target)

MicButton, LovedOneCard/selector, ConversationBubble, ConsentCheckbox/BranchSelector, BlessingCard, KeyboardInput, DPDPABadge, DeleteDataModal, AbuseReportForm, bottom navigation.

---

## Part VIII — Brand

### 8.1 Color (violet & gold)

| Token | Hex | Use |
|-------|-----|-----|
| Deep night | `#1C0F3A` | Background |
| Royal violet | `#3D2080` | Cards, bubbles |
| Soft violet | `#7B52C8` | Accents, borders |
| Temple gold | `#D4AF37` | CTAs, active states |
| Lavender text | `#F5F0FF` | Primary text |

### 8.2 Typography

**Display:** Cormorant Garamond (heritage). **Body:** Outfit. Load fonts in a **React Native–compatible** way (expo-font / @expo-google-fonts) — avoid web-only `@import` in RN.

---

## Part IX — Monetization (freemium)

**Core principle:** **Never gate access to the loved one's voice. Gate features, not conversations.**

| Capability | Free | Premium |
|---|---|---|
| Daily conversations | **Unlimited** | **Unlimited** |
| Conversation memory depth | Last **3** turns | Last **10** turns |
| Loved-one profiles | **1** | Up to **3** |
| Voice clone | 1 | Up to 3 |
| Morning greeting | **Text notification only** | **Voice + text** |
| ఆశీర్వాదం (Confidence Mode) | **Not available** | **Unlimited** |
| Saved blessings | **Not available** | **Unlimited** |
| Voice preview replays | Limited | Unlimited |
| Data export | Yes | Yes |

**Monetization philosophy:** A user whose grandmother passed away should never see "You've used your 3 free conversations today. Upgrade for ₹299/month." That moment would feel cruel, not premium. Free users can always talk to their loved one — the conversation is unlimited. Premium unlocks deeper memory (the AI remembers more), richer features (morning voice greetings, ఆశీర్వాదం mode, saved blessings), and more loved ones. The free experience is emotionally complete. The premium experience is meaningfully richer.

**Pricing direction:** ₹149–₹299 / mo India; $4.99–$9.99 diaspora; annual discount; first **50** beta users **lifetime premium** (optional promise — legal/marketing review).

---

## Part X — Delivery roadmap (8 weeks, compressible)

| Week | Theme | Outcomes |
|------|--------|----------|
| 1 | Emotion + prompts | 15+ Telugu dialogues; 3–5 speaker validation; relationship prompts |
| 2 | Backend + legal text drafts | Stable API + consent copy v0 |
| 3 | Voice + consent | S3 path, ElevenLabs, consent audio upload |
| 4 | RN core | 4-step wizard + **Voice Preview** + home + conversation + mic |
| 5 | Integration + security | E2E paths, encryption checklist, logging |
| 6 | Confidence + blessings + ToS/Privacy drafts | Lawyer review scheduled |
| 7 | Safety + polish | Abuse report, deletion, push, Telugu QA |
| 8 | Beta | 10–20 users, metrics, bug burn-down |

---

## Part XI — Competition & differentiation

Competitors (English grief clones, generic Telugu chat, short clips) lack the **bundle**: Telugu emotional register + **specific** loved one + **cloned voice** + **lawful consent** + **no raw conversation audio export** + **relationship tone** + **daily companion** positioning.

---

## Part XII — Beta success metrics

| Metric | Target |
|--------|--------|
| Emotional realness | ≥ **7**/10 |
| Voice likeness | ≥ **6.5**/10 |
| DAU-style opens | **60%** of actives |
| Session length | **3–5** min |
| 7-day retention | **70%** |
| Confidence mode tried | **40%** once |
| Consent completion | **95%+** |
| Abuse reports | **under 1%** of users |

---

## Part XIII — Out of scope (MVP)

iOS (phase 2) · more than 3 loved ones · video avatars · multi-language beyond **Telugu as primary AI language** · custom LLM · social features · **any** banned item from Section 4.6.

---

## Part XIV — User journey (start to finish, product steps)

1. **Discover** Swara → install.
2. **Platform consent** → register/login.
3. **Welcome slides** (voice, privacy, blessing promise).
4. **Step 1** identity + alive/deceased.
5. **Step 2** consent branch + voice upload + legal attestations.
6. **Voice Preview** — first greeting in cloned voice; **That sounds like them** / **That doesn't sound right**; store **`voiceAccepted`**.
7. **Step 3** phrases + values + support style.
8. **Step 4** belief + memory → “bring them to life” completion state.
9. **Home:** pick loved one (tier: 1 free / 3 premium) · see **Consent verified** (English) · morning card · recents.
10. **Conversation:** hold mic or type · hear reply · history grows (**memory depth** tiered per Part IX).
11. **Confidence mode** (premium) when needed · optional **save blessing** (premium).
12. **Blessings library** replay (premium).
13. **Privacy:** export / delete / consent records / abuse / resources.
14. **Profile:** plan, prefs, sign out.

---

## Part XV — MVP backlog (delta from current codebase)

Use this as the working sprint list; tick in project tracker, not only in this file.

| # | Area | Item |
|---|------|------|
| 1 | Schema | Add User: subscription, daily counts, consent timestamps, processing prefs, blocked flag |
| 2 | Schema | Add LovedOne: isDeceased, consentType, consentAudioUrl, consentDate, isActive, languageRegister |
| 3 | Schema | Add Conversation sentiment; Blessing.lovedOneId |
| 4 | Schema | Add AbuseReport model + migrations |
| 5 | API | OTP / phone verification if moving beyond password MVP |
| 6 | API | Consent recording endpoints + storage |
| 7 | API | `send-text`, delete loved one, delete-all-data, export-data, abuse report |
| 8 | API | Freemium **feature** gating (memory depth, premium-only features per Part IX); **no** daily conversation cap on free tier; cron/reset only where needed for non-conversation limits |
| 9 | Client | Split onboarding into **4 screens** + progress UI |
| 10 | Client | Conversation screen: header badges, mic, typing fallback |
| 11 | Client | Wire Privacy rows to real endpoints (not placeholder alerts) |
| 12 | Client | Push notifications + morning job |
| 13 | Legal | Lawyer-reviewed ToS, Privacy (Telugu + English), in-app notices |
| 14 | Ops | Breach runbook, DPDPA registration if applicable, admin audit logs |
| 15 | Client | Voice Preview & Acceptance screen after cloning (between Step 2 and Step 3) |
| 16 | Schema | Add LovedOne: `voiceAccepted` (Boolean), `totalConversations` (Int), `deepeningStage` (enum) |
| 17 | Schema | Add `MemorySummary` model for relationship deepening |
| 18 | Backend | `VoiceService` abstraction — provider-agnostic clone + synthesize interface |
| 19 | Backend | Memory summarization job (every 20 conversations per loved one) |
| 20 | Client | Restrict onboarding relationship chips to **Grandparent** + **Parent** only (Day 1) |
| 21 | Backend | Remove conversation count cap from free tier; implement feature-gating instead |
| 22 | Backend | Blessing export endpoint with audio watermark + AI-generated metadata tag |

---

## Part XVI — Vision Beyond MVP

### 16.1 If this works — what does Swara become?

| Phase | Scale | What changes |
|---|---|---|
| **MVP (now)** | 50 beta users | Telugu only. Grandparent + Parent. Validate emotional core. |
| **Phase 2** (post-beta) | 1K–10K users | Add Sibling, Partner, Friend, Mentor relationships. iOS launch. Hindi language support. Custom voice model replaces/supplements ElevenLabs. ఆశీర్వాదం sharing (exported blessings). |
| **Phase 3** | 10K–100K users | Tamil, Kannada, Malayalam support. Proactive voice preservation — families record loved ones *before* they pass. Family shared memories (opt-in). Enterprise: elder care facilities, hospice partnerships. |
| **Long-term** | 1M+ users | India's emotional AI platform. Every Indian language. Swara becomes the way families preserve and continue love across generations. "The voice that never left" is not a tagline — it's a cultural movement. |

### 16.2 Proactive preservation (Phase 3 concept)

The most powerful version of Swara isn't about recreating the dead — it's about preserving the living. Imagine a family that records their grandmother *now*, while she's alive, with her full consent and participation. She answers Swara's onboarding herself. She records her own phrases, her own blessings, her own voice. When she eventually passes, her grandchildren don't upload a scratchy WhatsApp note — they open Swara and she's already there, in full fidelity, because the family planned ahead.

This transforms Swara from a grief product into a **love preservation** product. The addressable market expands from "people who lost someone" to "every family that wants to keep someone's voice alive."

---

## Document control

- **Owner:** product / founder.
- **Review cadence:** after each beta cohort.
- **Change process:** edit `PRD.md`, bump version table at top, one-line **changelog** entry at bottom.

### Changelog

| Version | Date | Notes |
|---------|------|--------|
| 2.0 | 2026-04-13 | Ideology refresh (8 principles); grief/love framing in §1.2; English UI / Telugu feel; Voice Preview §3.2.1; Day-1 relationships Grandparent+Parent; freemium v2 (unlimited conversations); VoiceService §5.5; Part III-A deepening; blessing export exception §4.6; Part XVI vision; backlog 15–22; SCREEN_CONTENT v2.0 alignment for welcome slides |
| 1.0 | 2026-04-13 | Initial consolidated PRD from v5.0 narrative + repo audit + MVP gap table |
