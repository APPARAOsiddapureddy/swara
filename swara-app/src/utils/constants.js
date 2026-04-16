import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const COLORS = {
  background: '#1C0F3A',
  card: '#3D2080',
  accent: '#7B52C8',
  gold: '#D4AF37',
  goldLight: '#E8C84A',
  text: '#F5F0FF',
  textMuted: '#9B8EC4',
  mid: '#A89BC2',
  deepBg: '#0E0824',
  cardGlass: 'rgba(61,32,128,0.35)',
  darkCard: 'rgba(18,10,40,0.7)',
  overlay: 'rgba(14,8,36,0.92)',
  red: '#E8435A',
  green: '#4CAF50',
  bubble_ai: '#3D2080',
  bubble_user: '#5B3DB0',
};

/**
 * Metro / Expo Go exposes the dev machine host (e.g. 192.168.0.7:8081 in hostUri).
 * Use that IP with the API port so a physical phone on the same Wi‑Fi can reach the backend.
 */
function devHostFromExpo() {
  const uri = Constants.expoConfig?.hostUri;
  if (!uri || typeof uri !== 'string') return '';
  const host = uri.split(':')[0];
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
  return '';
}

function devApiPort() {
  const p =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_DEV_API_PORT
      ? String(process.env.EXPO_PUBLIC_DEV_API_PORT).replace(/\/$/, '')
      : '3000';
  return /^\d+$/.test(p) ? p : '3000';
}

/**
 * API base URL.
 * - Preferred: set EXPO_PUBLIC_API_URL (e.g. your Render URL).
 * - Optional: set expo.extra.defaultApiUrl in app.json as a fallback.
 * - Expo Go + LAN (local backend): if unset, we derive the PC IP from Expo and use port EXPO_PUBLIC_DEV_API_PORT (default 3000).
 * - Android emulator: http://10.0.2.2:3000
 * - iOS simulator / web dev: http://localhost:3000
 */
function resolveApiUrl() {
  const fromEnv =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL
      ? String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, '')
      : '';

  if (fromEnv) return fromEnv;

  const fromExtra = String(Constants.expoConfig?.extra?.defaultApiUrl || '').replace(/\/$/, '');
  if (fromExtra) return fromExtra;

  const lanHost = devHostFromExpo();
  if (lanHost && typeof __DEV__ !== 'undefined' && __DEV__) {
    return `http://${lanHost}:${devApiPort()}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${devApiPort()}`;
  }

  return `http://localhost:${devApiPort()}`;
}

export const API_URL = resolveApiUrl();
