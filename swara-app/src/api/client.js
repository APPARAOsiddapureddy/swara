import axios from 'axios';
import { API_URL } from '../utils/constants';

// Navigation ref for redirecting on 401 — set from App.js
export let navigationRef = null;
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Store ref — set from App.js
export let storeRef = null;
export const setStoreRef = (ref) => {
  storeRef = ref;
};

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach Bearer token
client.interceptors.request.use(
  (config) => {
    if (storeRef) {
      const token = storeRef.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (storeRef) {
        storeRef.getState().clearStore();
      }
      if (navigationRef && navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
    return Promise.reject(error);
  }
);

export default client;
