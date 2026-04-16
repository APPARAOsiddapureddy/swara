import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../utils/constants';
import Header from '../components/ui/Header';
import Badge from '../components/ui/Badge';
import Wave from '../components/ui/Wave';
import Btn from '../components/ui/Btn';
import client from '../api/client';
import { playAudio } from '../utils/audio';

export default function VoicePreviewScreen({ navigation, route }) {
  const lovedOneId = route?.params?.lovedOneId;
  const previewText = route?.params?.previewText || '';
  const previewAudioUrl = route?.params?.previewAudioUrl || '';

  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accepted, setAccepted] = useState(null);

  const quote = useMemo(() => (previewText ? `“${previewText}”` : ''), [previewText]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      // best-effort: stop wave animation
      setPlaying(false);
    });
    return unsub;
  }, [navigation]);

  const onPlay = async () => {
    if (!previewAudioUrl) return;
    try {
      setPlaying(true);
      await playAudio(previewAudioUrl);
    } catch {
      Alert.alert('Error', 'Could not play preview audio.');
    } finally {
      setPlaying(false);
    }
  };

  const persistChoice = async (nextAccepted) => {
    if (!lovedOneId) return;
    setSaving(true);
    try {
      await client.patch(`/api/loved-one/${lovedOneId}/voice-accept`, { voiceAccepted: nextAccepted });
    } catch {
      Alert.alert('Error', 'Could not save your choice. Please try again.');
      return;
    } finally {
      setSaving(false);
    }
    navigation.navigate('LovedOneSetup', { continueFromPreview: true, voiceAccepted: nextAccepted });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Header
        back
        title="Voice Preview"
        onBack={() => navigation.goBack()}
        right={<Badge text="NEW" color={COLORS.gold} />}
      />

      <View style={styles.center}>
        <View style={styles.ring}>
          <Wave size={60} anim={playing} />
        </View>

        <Text style={styles.h1}>Does this sound like them?</Text>
        <Text style={styles.sub}>We generated a short greeting in their cloned voice.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Preview greeting</Text>
          {quote ? <Text style={styles.quote}>{quote}</Text> : null}

          <TouchableOpacity
            style={[styles.playBtn, !previewAudioUrl && { opacity: 0.55 }]}
            onPress={onPlay}
            disabled={!previewAudioUrl || playing}
            activeOpacity={0.85}
          >
            <Text style={styles.playTxt}>{playing ? '■ Stop' : '▶ Play'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choice, accepted === false && styles.choiceNoOn]}
            onPress={() => setAccepted(false)}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.choiceIcon}>✕</Text>
            <Text style={[styles.choiceTxt, accepted === false && styles.choiceTxtOn]}>Doesn’t sound right</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choice, accepted === true && styles.choiceYesOn]}
            onPress={() => setAccepted(true)}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.choiceIcon}>♥</Text>
            <Text style={[styles.choiceTxt, accepted === true && styles.choiceTxtGold]}>That sounds like them</Text>
          </TouchableOpacity>
        </View>

        {accepted === false ? (
          <View style={styles.hintCard}>
            <Text style={styles.hint}>
              Try uploading a longer or clearer clip. You can also continue — quality often improves with more chats.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Btn
          disabled={accepted === null || saving}
          onPress={() => persistChoice(Boolean(accepted))}
        >
          {saving ? 'Saving…' : 'Next → Personality'}
        </Btn>
        {saving ? <ActivityIndicator style={{ marginTop: 10 }} color={COLORS.gold} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 82, 200, 0.12)',
    borderWidth: 2.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    marginBottom: 22,
  },
  h1: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  card: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.cardGlass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    marginBottom: 18,
  },
  cardLabel: { fontSize: 12, color: COLORS.gold, fontWeight: '700', marginBottom: 10 },
  quote: { fontSize: 15, color: COLORS.text, fontStyle: 'italic', lineHeight: 22, marginBottom: 14 },
  playBtn: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
  },
  playTxt: { color: COLORS.gold, fontWeight: '800' },
  choiceRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  choice: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    alignItems: 'center',
  },
  choiceNoOn: { borderColor: 'rgba(123, 82, 200, 0.44)', backgroundColor: 'rgba(123, 82, 200, 0.14)' },
  choiceYesOn: { borderColor: 'rgba(212, 175, 55, 0.44)', backgroundColor: 'rgba(212, 175, 55, 0.12)' },
  choiceIcon: { fontSize: 18, marginBottom: 6, color: COLORS.text },
  choiceTxt: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', fontWeight: '600' },
  choiceTxtOn: { color: COLORS.text },
  choiceTxtGold: { color: COLORS.gold },
  hintCard: {
    alignSelf: 'stretch',
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(123, 82, 200, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
  },
  hint: { fontSize: 12, color: 'rgba(245,240,255,0.82)', lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingBottom: 26, paddingTop: 10 },
});

