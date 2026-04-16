import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { COLORS } from '../utils/constants';
import useStore from '../store/useStore';
import { uploadAudio, playAudio } from '../utils/audio';
import MicButton from '../components/MicButton';
import client from '../api/client';

export default function ConversationScreen({ navigation, route }) {
  const scrollRef = useRef(null);
  const { lovedOne: storeLovedOne, setConversations } = useStore();
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [playing, setPlaying] = useState(false);

  const lovedOne = route?.params?.lovedOne || storeLovedOne;
  const lovedOneId = lovedOne?.id;

  const title = lovedOne?.name || 'Loved one';

  const [msgs, setMsgs] = useState([]);

  const loadHistory = async () => {
    if (!lovedOneId) return;
    setLoadingHistory(true);
    try {
      const res = await client.get(`/api/conversation/history/${lovedOneId}?limit=20`);
      const raw = res.data?.conversations || [];
      const mapped = raw
        .slice()
        .reverse()
        .flatMap((c) => [
          { id: `${c.id}_u`, from: 'user', text: c.userMessage, time: c.createdAt },
          { id: `${c.id}_a`, from: 'ai', text: c.aiResponse, time: c.createdAt, audioUrl: c.audioUrl },
        ]);
      setMsgs(mapped);
      // keep store in sync for other screens
      setConversations(
        mapped.map((m) => ({
          id: m.id,
          text: m.text,
          isUser: m.from === 'user',
          timestamp: m.time,
          audioUrl: m.audioUrl,
        }))
      );
    } catch (e) {
      // non-fatal
    } finally {
      setLoadingHistory(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 30);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lovedOneId]);

  const headerSubtitle = useMemo(() => {
    const rel = lovedOne?.relation ? String(lovedOne.relation) : '';
    return rel ? `● Consent verified · ${rel}` : '● Consent verified · AI companion';
  }, [lovedOne?.relation]);

  const onRecordingComplete = async (audioUri) => {
    if (!lovedOneId) {
      Alert.alert('Setup needed', 'Please set up a loved one first.');
      return;
    }
    setSending(true);
    try {
      const response = await uploadAudio(audioUri, '/api/conversation/send', { lovedOneId });
      const userText = response.userMessage || 'Voice message…';
      const aiText = response.aiResponse || response.text || response.response || '…';
      const aiAudioUrl = response.audioUrl || null;

      const now = new Date().toISOString();
      setMsgs((prev) => [
        ...prev,
        { id: `${Date.now()}_u`, from: 'user', text: userText, time: now },
        { id: `${Date.now()}_a`, from: 'ai', text: aiText, time: now, audioUrl: aiAudioUrl },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);

      if (aiAudioUrl) {
        setPlaying(true);
        try {
          await playAudio(aiAudioUrl);
        } finally {
          setPlaying(false);
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Could not send message.';
      Alert.alert('Error', String(msg));
    } finally {
      setSending(false);
    }
  };

  const playLine = async (audioUrl) => {
    if (!audioUrl) return;
    setPlaying(true);
    try {
      await playAudio(audioUrl);
    } catch {
      Alert.alert('Error', 'Could not play audio.');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>👴</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.hSub} numberOfLines={1}>
            {headerSubtitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.blessingChip}
          onPress={() => navigation.navigate('ConfidenceMode')}
          activeOpacity={0.85}
        >
          <Text style={styles.blessingChipTxt}>✦ ఆశీర్వాదం</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loadingHistory ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.gold} />
          </View>
        ) : msgs.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySub}>Hold the mic and speak in any language.</Text>
          </View>
        ) : (
          msgs.map((m) => (
            <View key={m.id} style={[styles.row, m.from === 'user' ? styles.rowUser : styles.rowAi]}>
              <View style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={styles.bubbleText}>{m.text}</Text>
                <View style={styles.metaRow}>
                  {m.from === 'ai' && m.audioUrl ? (
                    <TouchableOpacity onPress={() => playLine(m.audioUrl)} activeOpacity={0.8}>
                      <Text style={styles.spk}>🔊</Text>
                    </TouchableOpacity>
                  ) : null}
                  <Text style={styles.time}> </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.fakeInput}>
          <Text style={styles.fakeInputTxt}>Type in any language…</Text>
        </View>
        <View style={{ width: 10 }} />
        <MicButton onRecordingComplete={onRecordingComplete} size={64} />
      </View>

      {sending || playing ? (
        <View style={styles.toast}>
          <Text style={styles.toastTxt}>{sending ? 'Listening…' : 'Playing…'}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 82, 200, 0.10)',
  },
  backBtn: { paddingVertical: 6, paddingRight: 4 },
  backTxt: { color: COLORS.textMuted, fontSize: 18, fontWeight: '300' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 82, 200, 0.18)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.44)',
  },
  avatarTxt: { fontSize: 16 },
  hTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  hSub: { color: COLORS.green, fontSize: 10.5, marginTop: 2 },
  blessingChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
  },
  blessingChipTxt: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 24 },
  center: { paddingVertical: 40, alignItems: 'center' },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  emptySub: { color: COLORS.textMuted, fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', marginBottom: 10 },
  rowUser: { justifyContent: 'flex-end' },
  rowAi: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: 'rgba(123, 82, 200, 0.86)',
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: COLORS.text, fontSize: 13.5, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  spk: { opacity: 0.7, fontSize: 12 },
  time: { color: 'rgba(155, 142, 196, 0.66)', fontSize: 9 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 82, 200, 0.10)',
  },
  fakeInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
  },
  fakeInputTxt: { color: 'rgba(155, 142, 196, 0.77)', fontSize: 12.5 },
  toast: {
    position: 'absolute',
    bottom: 92,
    left: 16,
    right: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 8, 36, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    alignItems: 'center',
  },
  toastTxt: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
});

