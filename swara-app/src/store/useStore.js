import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  lovedOne: null,
  conversations: [],
  blessings: [],
  isRecording: false,
  isLoading: false,
  currentAudio: null,

  // Actions
  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user)).catch(console.error);
    } else {
      AsyncStorage.removeItem('user').catch(console.error);
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      AsyncStorage.setItem('token', token).catch(console.error);
    } else {
      AsyncStorage.removeItem('token').catch(console.error);
    }
  },

  setLovedOne: (lovedOne) => {
    set({ lovedOne });
    if (lovedOne) {
      AsyncStorage.setItem('lovedOne', JSON.stringify(lovedOne)).catch(console.error);
    } else {
      AsyncStorage.removeItem('lovedOne').catch(console.error);
    }
  },

  addConversation: (message) => {
    set((state) => ({
      conversations: [...state.conversations, message],
    }));
  },

  setConversations: (conversationsOrUpdater) => {
    if (typeof conversationsOrUpdater === 'function') {
      set((state) => ({
        conversations: conversationsOrUpdater(state.conversations),
      }));
    } else {
      set({ conversations: conversationsOrUpdater });
    }
  },

  setBlessings: (blessings) => {
    set({ blessings });
  },

  addBlessing: (blessing) => {
    set((state) => ({
      blessings: [blessing, ...state.blessings],
    }));
  },

  setRecording: (isRecording) => {
    set({ isRecording });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setCurrentAudio: (currentAudio) => {
    set({ currentAudio });
  },

  clearStore: () => {
    set({
      user: null,
      token: null,
      lovedOne: null,
      conversations: [],
      blessings: [],
      isRecording: false,
      isLoading: false,
      currentAudio: null,
    });
    AsyncStorage.multiRemove(['token', 'user', 'lovedOne']).catch(console.error);
  },

  loadPersistedState: async () => {
    try {
      const [token, userStr, lovedOneStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('lovedOne'),
      ]);

      const updates = {};
      if (token) updates.token = token;
      if (userStr) {
        try { updates.user = JSON.parse(userStr); } catch (_) {}
      }
      if (lovedOneStr) {
        try { updates.lovedOne = JSON.parse(lovedOneStr); } catch (_) {}
      }

      set(updates);
      return { token, user: updates.user, lovedOne: updates.lovedOne };
    } catch (error) {
      console.error('loadPersistedState error:', error);
      return { token: null, user: null, lovedOne: null };
    }
  },
}));

export default useStore;
