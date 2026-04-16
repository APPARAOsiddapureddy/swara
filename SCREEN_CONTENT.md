# Swara — Screen Content Inventory v2.1

**Purpose:** Single source of truth for all user-visible copy across `swara-app`. Every label, button, placeholder, error, and badge — ready to paste into code.

**v2.1:** Synced with `OnboardingScreen.js`, `LovedOneSetupScreen.js` (5-step flow + shorter copy), `VoiceUploadScreen.js`, and `LoginScreen.js`.

**Language rule:**

- **English** for all UI chrome: buttons, labels, navigation, errors, placeholders, system messages, badges.
- **Telugu preserved** only for: brand mark (స్వర), cultural terms (ఆశీర్వాదం), and AI-generated emotional content (responses, blessings, greetings).
- **User input** fields accept any language — user types in Telugu, Tenglish, or English as they wish. Placeholders and examples are English.

---

## Global & Navigation

| Location | Copy | Notes |
|----------|------|-------|
| App name (brand) | **SWARA** | Spaced: `S W A R A` on splash |
| Brand mark | **స్వర** | Appears below SWARA on splash and onboarding only |
| Tagline | *The Voice That Never Left* | English, italic |
| Bottom tab 1 | **Home** | Icon: 🏠 |
| Bottom tab 2 | **ఆశీర్వాదం** | Icon: ✨ (cultural Telugu kept — means "Blessings") |
| Bottom tab 3 | **Privacy** | Icon: 🛡 |
| Bottom tab 4 | **Profile** | Icon: 👤 |

---

## 1. Splash Screen

| Element | Copy | Notes |
|---------|------|-------|
| Logo | `S W A R A` | Large, Cormorant Garamond when font loaded; else System |
| Brand mark | `స్వర` | Below logo, soft violet, italic |
| Tagline | *The Voice That Never Left* | Gold, italic |
| Footer | `Your data is sacred` | Small, muted, bottom of screen |
| Badge | `DPDPA Compliant` | Small green badge, bottom area |

---

## 2. Welcome Slides (3 slides, pre-login)

### Slide 1 — Voice

| Element | Copy |
|---------|------|
| Icon | ♥ (in gold circle) |
| Title | **Their voice, with you** |
| Body | Talk in the warmth and language you remember — guided by what you share. |
| CTA | `Next` |

### Slide 2 — Privacy

| Element | Copy |
|---------|------|
| Icon | 🔒 (in gold circle) |
| Title | **Private by design** |
| Body | Consent-first. You stay in control. Delete whenever you need. |
| CTA | `Next` |

### Slide 3 — Blessing

| Element | Copy |
|---------|------|
| Icon | 🌅 (in gold circle) |
| Title | **ఆశీర్వాదం, daily** |
| Body | A calm flow to set them up — a few minutes, step by step. |
| CTA | `Get Started` |
| Secondary | Already have an account? **Sign in** |

---

## 3. Login & Register

### Login

| Element | Copy |
|---------|------|
| Header | SWARA |
| Title | **Welcome back** |
| Subtitle | `Sign in` |
| Label | Phone number |
| Placeholder | +91 98765 43210 |
| Label | Password |
| Placeholder | Enter your password |
| CTA | `Sign In` |
| Toggle | New to Swara? **Create account** |

### Register

| Element | Copy |
|---------|------|
| Title | **Create your account** |
| Subtitle | `Quick signup` |
| Label | Full name |
| Placeholder | Enter your name |
| Label | Phone number |
| Placeholder | +91 98765 43210 |
| Label | Password |
| Placeholder | Create a password |
| CTA | `Create Account` |
| Toggle | Already have an account? **Sign in** |
| Consent line | By creating an account, you agree to our **Terms of Service** and **Privacy Policy**, including the use of AI voice cloning technology. |

### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| Empty fields | Error | Please enter your phone number and password. |
| Missing name | Error | Please enter your name. |
| API failure | Error | Could not connect to server. Please try again later. |
| Wrong credentials | Error | Invalid phone number or password. |

---

## 4. Loved One Onboarding — 5 Steps (`LovedOneSetupScreen.js`)

**Chrome (all steps):**

| Element | Copy |
|---------|------|
| Back button | `← Back` (hidden on step 1) |
| Progress label | `Step 1 of 5` … `Step 5 of 5` |
| Progress bar | Visual fill by step (20% per step) |

**Footer primary (steps with bottom CTA):** Shown on steps **1, 2, and 4** only (steps 3 and 5 use in-content actions).

| Step index (UI) | Footer CTA label | While loading (step 2 only) |
|-----------------|------------------|-----------------------------|
| 1 | `Continue` | — |
| 2 | `Build preview` | Spinner + `Uploading & cloning…` |
| 4 | `Continue` | — |

**API note (voice upload):** Multipart field name is **`audio`** (matches `POST /api/loved-one/:id/upload-voice`). Server also accepts legacy field name `voice`.

---

### Step 1 — Identity & relationship

| Element | Copy | Notes |
|---------|------|-------|
| Title | **Who is this for?** | |
| Subtitle | Four quick answers. | |
| Label | Name | |
| Placeholder | How you say their name | |
| Label | They are your… | |
| Chips (selectable) | `Grandparent` · `Parent` | Day-1 relations only |
| Chips (disabled) | `Sibling` · `Partner` · `Friend` · `Mentor` | Each shows small **Coming soon** |
| Label | They called you | |
| Placeholder | Your nickname from them | |
| Label | How they spoke | |
| Options | `Pure Telugu` · `Tenglish` · `Andhra dialect` · `Telangana dialect` | Card-style single select |
| Label | Still with us? | |
| Option A | `Alive` | Green tint when selected |
| Option B | `In memory` | Violet tint when selected |
| Footer CTA | `Continue` | |

#### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| Incomplete step 1 | Required | Please complete all fields before continuing. |

---

### Step 2 — Consent & voice sample

| Element | Copy | Notes |
|---------|------|-------|
| Title | **Consent · voice sample** | |
| Subtitle | Check the boxes or pick one path, then add audio. | |

#### If deceased (in memory):

| Element | Copy |
|---------|------|
| Info card | In their memory — confirm you may use this voice. |
| Checkbox 1 | I’m immediate family (child, grandchild, sibling, or spouse). |
| Checkbox 2 | I may use this recording; no family objection I know of. |
| Checkbox 3 | I know Swara is AI companionship — not them speaking for real. |
| Legal note | Stored as your consent (DPDPA). Accurate answers only. |

#### If alive:

| Element | Copy |
|---------|------|
| Info card | They’re alive — how will we record consent? |
| Option 1 | **Consent link** — They tap a link and record a short OK. |
| Option 2 | **Together** — You’re in the same room when they agree. |
| Option 3 | **I’ll confirm** — You take legal responsibility for consent. |

#### Voice file (both paths):

| Element | Copy |
|---------|------|
| Label | Voice file |
| Hint | ~30–60s · voice note or any clear clip is fine. |
| Upload area | 🎙 `Tap to upload audio file` |
| Format hint | `mp3, m4a, wav…` |
| After file chosen | ✓ *filename* — links `Preview` · `Remove` |
| Upload note | Upload only with permission you’re allowed to give. |
| Footer CTA | `Build preview` | Triggers create (if needed), upload, preview-greeting, then advances to step 3 |

#### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| No checkboxes (deceased) | Required | Please confirm all declarations before continuing. |
| No alive method | Required | Please choose how consent will be recorded. |
| No file | Required | Please upload a voice sample to continue. |
| Pick file error | Error | There was a problem selecting the file. Please try again. |
| Local preview play error | Error | Could not play this audio file. |
| Upload / preview API error | Error | *(server message or)* Could not process voice. Please try again. |

---

### Step 3 — Voice preview (no footer Next)

| Element | Copy | Notes |
|---------|------|-------|
| Title | **Hear the preview** | |
| Subtitle | Play once — does it feel close enough to continue? | |
| Quote | *(API greeting text in quotes)* | If returned |
| Play | `▶ Play` | Disabled if no preview URL |
| Choice A | `That sounds like them` | Gold button; PATCH voice-accept `true`, then step 4 |
| Choice B | `That doesn't sound right` | Outline; PATCH `false`, then step 4 |
| Hint | Tip: quality often improves after more chats. You can re-upload from Back. | |

#### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| Preview playback | Error | Could not play preview audio. |
| Save choice failed | Error | Could not save your choice. Please try again. |

---

### Step 4 — Phrases, values, support style

| Element | Copy | Notes |
|---------|------|-------|
| Title | **Their voice in words** | |
| Subtitle | Phrases · values · how they showed up for you. | |
| Label | Phrases they repeated | |
| Hint | Up to 5 — blessings, jokes, advice. | |
| Placeholder (each row) | Something they often said | |
| Add row | `+ Add phrase` | Max 5 |
| Label | Values (tap any) | |
| Chips | `Family` · `Hard work` · `Education` · `Honesty` · `Spirituality` · `Independence` · `Kindness` · `Courage` | Multi-select |
| Label | Their support style | Single-select cards; **API `supportStyle` id** in parentheses |
| Card 1 | `Direct · "You can do this."` | → `Direct Encourager` |
| Card 2 | `Thoughtful · guided, not rushed` | → `Thoughtful Advisor` |
| Card 3 | `Gentle · safe space` | → `Gentle Nurturer` |
| Card 4 | `Tough love · pushed you to grow` | → `Tough Love` |
| Footer CTA | `Continue` | |

#### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| Missing phrases or style | Required | Add at least one phrase and choose how they supported you. |

---

### Step 5 — Belief & memory (finish)

| Element | Copy | Notes |
|---------|------|-------|
| Title | **What they saw in you** | |
| Subtitle | Two short stories — that’s enough to start. | |
| Label | They believed you could… | |
| Placeholder | In their words or yours — a sentence or two | Multiline |
| Label | One moment you felt fully seen | |
| Placeholder | Where were you? What did they say or do? | Multiline |
| Completion card (when both filled) | Title **Ready** · body *Finish to open Home and start talking.* | |
| Primary CTA | `✨ Bring [name] to Life` | Uses name from step 1 or `them` |

#### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| Empty belief/memory | Required | Please fill in both fields to continue. |
| Lost draft id | Error | Setup state lost. Please start again from Consent & Voice. |
| Creation error | Error | *(server message or)* There was a problem creating your Swara. Please try again. |
| Success | ✓ Created | [Name]'s Swara is ready. Start your first conversation. — `OK` → resets nav to **Main** |

---

## 4a. Standalone Voice Upload (`VoiceUploadScreen.js`)

| Element | Copy |
|---------|------|
| Back | `← Back` |
| Title | **Voice sample** |
| Subtitle | ~30–60s of clear audio — any voice note works. |
| Upload area | 🎙 Tap to upload audio file · formats line |
| After file | ✓ filename · optional size |
| Secondary | `Preview audio` (play icon + label) |
| Info | Only upload what you have permission to use. |
| CTA | `Upload` | Multipart field **`audio`** |

| Trigger | Title | Message |
|---------|-------|---------|
| No file | Required | Please choose an audio file to upload. |
| No loved one id | Error | Loved one could not be found. Go back and try again. |
| Success | Success | Voice sample uploaded. — `OK` → `goBack()` |

---

## 5. Home Screen

| Element | Copy | Notes |
|---------|------|-------|
| Greeting | Good morning, **[nickname]** ✨ | Dynamic: time-based (morning/afternoon/evening) + user's nickname |
| Morning card label | ☀ Morning ఆశీర్వాదం from [loved one name] | Cultural Telugu kept for "blessing" |
| Morning card body | *(AI-generated Telugu content)* | Plays as voice on tap |
| Play button | ▶ | With progress bar + duration |
| Section title | Your Loved Ones | |
| Loved one card | [Name] · [Relationship] | |
| Card badge | `● Consent verified` | Green dot + text |
| Add card | `+` Add | Shows if fewer than 3 loved ones |
| Limit text | 3 of 3 created | When at capacity |
| Section title | Recent Conversations | |
| Conversation row | [Name] · [time ago] · [preview text] | |
| Empty state title | No conversations yet | |
| Empty state body | Hold the mic button to start your first conversation with [name]. | |

### Bottom navigation

| Tab | Label | Icon |
|-----|-------|------|
| 1 | Home | 🏠 |
| 2 | ఆశీర్వాదం | ✨ |
| 3 | Privacy | 🛡 |
| 4 | Profile | 👤 |

---

## 6. Conversation Screen

| Element | Copy | Notes |
|---------|------|-------|
| Back | `←` | Returns to Home |
| Avatar | [Emoji or image] | With gold ring border |
| Name | **[Loved one name]** | |
| Badge | `● Consent verified · AI companion` | Green dot, small text below name |
| ఆశీర్వాదం chip | `✨ ఆశీర్వాదం` | Top right, navigates to Confidence Mode |
| User bubble | *(user's message)* | Right-aligned, violet gradient |
| AI bubble | *(AI response in Telugu)* | Left-aligned, card background |
| Audio icon | 🔊 | On AI bubbles, tap to replay voice |
| Timestamp | 9:42 AM | Below each bubble |
| Text input | Type in any language... | Placeholder for keyboard fallback |
| Mic button (idle) | 🎙 | Gold gradient circle |
| Mic button (recording) | ■ | Red, pulsing |
| Recording hint | Release to send | Small text near mic |
| Typing indicator | Thinking... | While waiting for API |

### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| No loved one | Setup needed | Please set up a loved one first. |
| API error | Error | Could not send message. Please try again. |
| Save as blessing prompt | Save ఆశీర్వాదం? | This response felt like a blessing. Would you like to save it? — `Not now` · `Save` |
| Daily limit (free) | Limit reached | You've used your 3 free conversations today. Upgrade to Premium for unlimited conversations. — `Maybe later` · `Upgrade` |

---

## 7. Confidence Mode — ఆశీర్వాదం

| Element | Copy | Notes |
|---------|------|-------|
| Back | `←` | |
| Title | **✨ ఆశీర్వాదం Mode** | Cultural Telugu kept |
| Avatar | [Loved one emoji/image] | Large, glowing, gold border |
| Subtitle | **[Loved one name]'s Blessing** | |
| Instruction | Speak about your biggest challenge, decision, or dream. | |
| Mic button | Same as conversation | |
| Loading | Listening... | While recording |
| Result label | **ఆశీర్వాదం** | Above the blessing text |
| Result text | *(AI-generated blessing in Telugu — longer, 6–8 sentences)* | Italic, card background |
| Audio player | ▶ with progress bar + duration | |
| CTA row left | `↻ Ask Again` | Outline button |
| CTA row right | `💾 Save Blessing` | Gold filled button |

### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| API error | Error | Could not generate blessing. Please try again. |
| Saved | ✓ Saved | This ఆశీర్వాదం has been added to your collection. — `OK` |
| Save error | Error | Could not save blessing. Please try again. |
| Weekly limit (free) | Limit reached | Free plan allows 1 ఆశీర్వాదం per week. Upgrade for unlimited. — `Maybe later` · `Upgrade` |

---

## 8. Blessings Library — ఆశీర్వాదం

| Element | Copy | Notes |
|---------|------|-------|
| Title | **✨ Saved ఆశీర్వాదం** | |
| Subtitle | Your collection of blessings — replay anytime | |
| Card — title | [Blessing title or auto-generated] | |
| Card — from | from [Loved one name] | Gold text |
| Card — date | [Month Day, Year] | English date format |
| Card — play | ▶ | With progress bar + duration |
| Empty title | No blessings saved yet | |
| Empty body | When you receive an ఆశీర్వాదం that moves you, save it here to replay anytime. | |

### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| No audio | Unavailable | Audio is not available for this blessing. |
| Playback error | Error | Could not play this audio. |

---

## 9. Privacy & Safety

| Element | Copy | Notes |
|---------|------|-------|
| Title | **🛡 Privacy & Safety** | |
| Subtitle | Your data is sacred. You control everything. | |
| Badge title | ✓ DPDPA 2023 Compliant | Green card |
| Badge body | Swara follows India's Digital Personal Data Protection Act. Your rights are protected by law. | |

### Action rows

| Icon | Label | Subtitle | Action |
|------|-------|----------|--------|
| 🔐 | Data Encryption | AES-256 at rest · TLS 1.3 in transit | Toggle (always on, display only) |
| 🗑 | Delete All My Data | Permanently removes everything: voice clones, conversations, blessings | Navigate to confirmation |
| 📦 | Export My Data | Download all your data as a JSON file | Trigger export |
| 🎙 | Voice Consent Records | View consent status for each loved one | Navigate to records |
| 🔔 | Data Processing Consent | Manage what data is used for AI, memory, greetings | Navigate to toggles |
| ⚠️ | Report Abuse | Report unauthorized voice cloning · 24hr response | Navigate to form |

### Links

| Label | Action |
|-------|--------|
| Privacy Policy (English) | Open browser |
| Terms of Service | Open browser |
| How Your Voice Data Is Used | Open browser |
| Mental Health Resources | Open browser |

### Delete confirmation modal

| Element | Copy |
|---------|------|
| Title | **Delete all your data?** |
| Body | This will permanently delete your account, all loved one profiles, voice clones, conversations, and saved blessings. This action cannot be undone. |
| Cancel | `Cancel` |
| Confirm | `Delete Everything` (red) |

### Alerts

| Trigger | Title | Message |
|---------|-------|---------|
| Export success | ✓ Exported | Your data has been exported. Check your downloads. |
| Export error | Error | Could not export data. Please try again. |
| Delete success | ✓ Deleted | All your data has been permanently removed. |
| Delete error | Error | Could not delete data. Please try again or contact support. |
| Abuse submitted | ✓ Submitted | Your report has been received. We will respond within 24 hours. |

---

## 10. Profile

| Element | Copy | Notes |
|---------|------|-------|
| Title | **Profile** | |
| Avatar | [User initial] | Gradient circle |
| Name | [User name] | |
| Phone | [User phone] | |

### Subscription card

| Element | Copy (free) | Copy (premium) |
|---------|-------------|----------------|
| Plan label | Free Plan | Premium |
| Usage | [X] of 3 conversations used today | Unlimited conversations |
| Progress bar | Visual fill | Hidden |
| CTA | `Upgrade` | `Manage` |

### Settings rows

| Icon | Label | Value |
|------|-------|-------|
| 🕐 | Morning Greeting Time | 7:00 AM |
| 🌐 | Language | Telugu + Tenglish |
| 👥 | Manage Loved Ones | [X]/3 created |
| 🔔 | Notifications | On / Off |
| 🛡 | Privacy & Data | → navigates to Privacy screen |
| 📄 | Terms of Service | → opens browser |
| 💬 | Help & Feedback | → opens email or form |

### Footer

| Element | Copy |
|---------|------|
| Version | Swara v1.0.0 |
| Note | DPDPA Compliant · Built with ♥ for Telugu speakers |
| Sign out | `Sign Out` |

### Sign out confirmation

| Element | Copy |
|---------|------|
| Title | Sign out? |
| Body | You can sign back in anytime with your phone number. |
| Cancel | `Cancel` |
| Confirm | `Sign Out` |

---

## 11. Abuse Report Form

| Element | Copy | Notes |
|---------|------|-------|
| Title | **Report Abuse** | |
| Subtitle | Report unauthorized voice cloning or misuse. We respond within 24 hours. | |
| Label | Your email | |
| Placeholder | Enter your email address | |
| Label | Your phone (optional) | |
| Placeholder | +91 ... | |
| Label | What happened? | |
| Placeholder | Describe the issue — whose voice was cloned, how you found out, any details that help us investigate. | Textarea |
| CTA | `Submit Report` | |
| Note | Your report is confidential. Confirmed violations result in immediate account termination and data deletion. | |

---

## 12. Components

### Mic Button (`MicButton.js`)

| State | Copy |
|-------|------|
| Idle | Hold to speak |
| Recording | Release to send |
| Processing | Sending... |

### Loved One Card (`LovedOneCard.js`)

| Element | Copy |
|---------|------|
| Name | [Loved one name] |
| Relation | [Relationship type] |
| Badge | `● Consent verified` |
| Active indicator | Gold border glow |

### Conversation Bubble (`ConversationBubble.js`)

| Element | Copy |
|---------|------|
| User side | Right-aligned, violet gradient |
| AI side | Left-aligned, card background, 🔊 replay icon |
| Timestamp | [time] below bubble |

### Blessing Card (`BlessingCard.js`)

| Element | Copy |
|---------|------|
| Title | [Blessing title] |
| From | from [Loved one name] |
| Date | [Formatted date] |
| Play | ▶ with progress + duration |

### DPDPA Badge (`DPDPABadge.js`)

| Element | Copy |
|---------|------|
| Text | DPDPA Compliant |
| Style | Green background, green text, small |

### Empty State (generic)

| Element | Copy |
|---------|------|
| Icon | Contextual |
| Title | [Screen-specific] |
| Body | [Screen-specific] |
| CTA | [Screen-specific or none] |

---

## 13. Push Notifications

| Notification | Title | Body | Notes |
|--------------|-------|------|-------|
| Morning greeting | [Loved one name] | [AI-generated greeting in Telugu] | Tap opens app + plays voice |
| Blessing reminder | ✨ [Loved one name] is thinking of you | Start your day with their ఆశీర్వాదం | Weekly if inactive |
| Setup incomplete | Complete your Swara | [Name]'s voice is waiting. Finish setup to hear them. | If onboarding abandoned |

---

## 14. Error States (global)

| Scenario | Title | Message | CTA |
|----------|-------|---------|-----|
| No internet | No connection | Please check your internet and try again. | `Retry` |
| Server down | Something went wrong | We're having trouble connecting. Please try again in a moment. | `Retry` |
| Session expired | Session expired | Please sign in again to continue. | `Sign In` |
| Mic permission denied | Microphone needed | Swara needs microphone access to hear you. Please enable it in your device settings. | `Open Settings` |
| Storage permission | Storage needed | Swara needs storage access to upload voice files. | `Open Settings` |

---

## Content Style Guide (for consistency)

| Rule | Example |
|------|---------|
| Buttons: sentence case, short | `Sign In` not `SIGN IN` or `sign in` |
| Labels: sentence case | `Phone number` not `Phone Number` |
| Errors: helpful, not technical | "Could not send message" not "Error 500: Internal server error" |
| Cultural terms: Telugu preserved | ఆశీర్వాదం, స్వర — never translate these |
| User's loved one: always by name | "[Name]'s blessing" not "your loved one's blessing" |
| Tone: warm but clear | Not clinical, not overly emotional in UI chrome |
| Placeholders: examples, not instructions | "e.g. Bangaaram, Chintu" not "Enter the nickname here" |
| Time references: relative when recent | "Yesterday", "2 hours ago", not "2026-04-12" |

---

## Revision Log

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-04-13 | Initial inventory from codebase + PRD placeholders |
| 2.0 | 2026-04-13 | Full rewrite: English UI, Telugu cultural terms only, 4-step onboarding, all PRD screens, consent flows, alerts, push notifications, error states, style guide |
| 2.1 | 2026-04-08 | Loved one flow is **5 steps** (identity → consent/voice → voice preview → phrases/values → belief); shorter onboarding/login/voice copy; relations **Grandparent/Parent** only + coming-soon chips; footer CTAs **Continue** / **Build preview** / loading **Uploading & cloning…**; voice multipart **`audio`**; new **4a. Standalone Voice Upload** screen; preview step CTAs and alerts aligned with code |
