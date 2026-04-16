# స్వర · Swara

**The Voice That Never Left**

Swara is a Telugu-first voice AI app that lets users speak to an AI version of their most loved person — a grandfather, mother, or mentor — who responds in that person's cloned voice with moral support and encouragement in Telugu.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli` or use `npx expo`
- Android emulator (Android Studio) or iOS Simulator (Xcode)
- Expo Go app on a physical device (optional)

### Installation

```bash
cd swara-app
npm install
npx expo start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

---

## App Architecture

### Navigation

```
Root Stack Navigator
├── Onboarding           ← Welcome screen with sound wave animation
├── Login                ← Phone + password auth (login/register toggle)
├── LovedOneSetup        ← 5-step wizard (incl. voice preview) to create a Swara persona
├── VoiceUpload          ← Standalone voice upload screen
├── ConfidenceMode       ← Blessing / deep encouragement mode
└── Main (Tab Navigator)
    ├── Home             ← Main conversation screen
    ├── Blessings        ← Saved blessings list
    └── Profile          ← User info + sign out
```

### State Management (Zustand)

`src/store/useStore.js` holds:
- `user` — authenticated user object
- `token` — JWT persisted in AsyncStorage
- `lovedOne` — the configured Swara persona
- `conversations` — current session messages
- `blessings` — saved blessings
- `isRecording` / `isLoading` — UI state flags

Token and user are automatically persisted to AsyncStorage and rehydrated on launch.

### API Client (Axios)

`src/api/client.js` wraps Axios with:
- Auto-attached `Authorization: Bearer <token>` header
- 401 → auto clear store + redirect to Login

Change `API_URL` in `src/utils/constants.js` for your backend.

---

## Brand Design System

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#1C0F3A` | Deep Violet — screen bg |
| `card` | `#3D2080` | Royal Violet — cards, bubbles |
| `accent` | `#7B52C8` | Soft Violet — borders, rings |
| `gold` | `#D4AF37` | Gold — CTAs, active states |
| `text` | `#F5F0FF` | Off-white lavender |
| `textMuted` | `#9B8EC4` | Muted labels |

---

## API Endpoints Expected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with phone + password |
| POST | `/api/auth/register` | Register with name + phone + password |
| POST | `/api/loved-one/create` | Create Swara persona |
| POST | `/api/loved-one/:id/upload-voice` | Upload voice sample |
| POST | `/api/conversation/send` | Send audio → get AI response |
| GET | `/api/conversation/history` | Fetch last N messages |
| POST | `/api/blessing/save` | Save a blessing |
| GET | `/api/blessing/list` | List all saved blessings |

### Auth response shape
```json
{
  "token": "jwt_token_here",
  "user": { "id": "1", "name": "రాము", "phone": "+919876543210" },
  "lovedOne": null
}
```

### Conversation response shape
```json
{
  "text": "నాయనా, నువ్వు చేయగలవు...",
  "audioUrl": "https://cdn.example.com/audio/response.mp3",
  "transcription": "User's spoken text",
  "isConfidence": false
}
```

---

## Key Components

### `MicButton`
Hold-to-record button. Uses `expo-av` Audio.Recording. Pulses while recording. Calls `onRecordingComplete(uri)` on release.

### `LovedOneAvatar`
Three concentric circles. Pulses with scale animation when `isSpeaking`. Shows the first letter of the loved one's name.

### `ConversationBubble`
Chat bubble. Left-aligned (AI, `#3D2080`) or right-aligned (user, `#5B3DB0`). Shows timestamp.

### `BlessingCard`
Card with gold left border. Play button triggers `onPlay(blessing)`.

---

## Telugu Support

Telugu script renders natively on Android (API 21+) and iOS (11+) without any special font loading. The app uses `fontFamily: 'System'` throughout — the system Telugu font (Noto Sans Telugu on Android, Kohinoor Telugu on iOS) will automatically handle Telugu script.

---

## Audio Utilities (`src/utils/audio.js`)

| Function | Description |
|----------|-------------|
| `startRecording()` | Request permission + start HIGH_QUALITY recording |
| `stopRecording(rec)` | Stop recording, return `{ uri, mimeType }` |
| `playAudio(uri)` | Play from local URI or remote URL |
| `stopAudio()` | Stop any currently playing audio |
| `uploadAudio(uri, endpoint, extra)` | Multipart POST upload |

---

## Environment

For Android emulator, `10.0.2.2` maps to `localhost` on the host machine.

For physical devices or production, set **`EXPO_PUBLIC_API_URL`** before starting Metro or before a cloud build (see below). The app reads it in `src/utils/constants.js` (falls back to Android emulator `10.0.2.2:3000` or `localhost` on web).

---

## Install on your phone (internal / debug build)

You need an **APK** whose JavaScript is **bundled inside** the app (not Expo Go) and whose API base points at a URL your **phone can reach** (same Wi‑Fi as your laptop, or a deployed server).

### Option A — EAS cloud build (recommended)

1. Install deps: `cd swara-app && npm install`
2. Log in: `npx eas login` (Expo account)
3. Link the project (first time only): `npx eas init` — creates `extra.eas.projectId` in `app.json` when you confirm
4. Set the API URL your phone will use, e.g. same Wi‑Fi as your Mac:
   ```bash
   export EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
   ```
   Replace `192.168.x.x` with your machine’s LAN IP (`ipconfig getifaddr en0` on macOS). Your **Swara backend** must listen on `0.0.0.0:3000` (not only `localhost`) so the phone can connect.
5. Build an **APK**:
   ```bash
   npm run eas:apk
   ```
   Or: `npx eas build --platform android --profile preview`
6. When the build finishes, open the link on **your phone** and install the APK (Android may ask you to allow “Install unknown apps” for the browser or Files app).

`eas.json` profile **`preview`** builds an **APK** with **internal** distribution (good for testers). Payments / Play Store are not required.

### Option B — Local Gradle APK (Android Studio / JDK 17)

1. Use **JDK 17** for Gradle (Java 21+ can break older Gradle; Java 25 needs a newer Gradle than this template ships with):
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo "$JAVA_HOME")
   ```
2. Set API URL for the bundle **at build time**:
   ```bash
   export EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000
   ```
3. From `swara-app`:
   ```bash
   npm run android:apk
   ```
4. Install the file:
   **`android/app/build/outputs/apk/release/app-release.apk`**
   (AirDrop, USB file transfer, or `adb install -r`).

**Cleartext HTTP** is enabled in the Android manifest so `http://192.168…` works for local dev. Use **HTTPS** in production.

---

*స్వర · Swara — v1.0.0*
