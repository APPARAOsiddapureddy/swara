import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { COLORS } from '../utils/constants';
import client from '../api/client';

const TOPICS = {
  privacy: {
    title: 'Privacy Policy',
    body:
      'Swara stores your account details, loved one profiles, and conversation history to provide the experience.\n\n' +
      'Voice data: voice samples and synthesized audio may be stored to generate responses in the selected voice.\n\n' +
      'You can export or delete your data anytime from this screen.',
  },
  terms: {
    title: 'Terms of Service',
    body:
      'Swara is provided for personal use during testing. Do not upload audio you do not have rights to share.\n\n' +
      'You are responsible for consent to use someone’s voice. Report any abuse from the Privacy & Safety screen.',
  },
  voice: {
    title: 'How Your Voice Data Is Used',
    body:
      'Swara uses a voice sample you upload to create a voice profile.\n\n' +
      'That voice profile is used to synthesize audio for responses. You can remove the voice profile by deleting your data.',
  },
  encryption: {
    title: 'Data Encryption',
    body:
      'In transit: TLS protects data between the app and server.\n\n' +
      'At rest: your database and stored files should be protected by your hosting provider encryption settings.\n\n' +
      'For production: enable HTTPS, secure secrets, and restrict database access.',
  },
};

export default function PrivacyDetailScreen({ navigation, route }) {
  const topicKey = String(route?.params?.topic || 'privacy');
  const topic = TOPICS[topicKey] || TOPICS.privacy;

  const [busy, setBusy] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reportContact, setReportContact] = useState('');

  const actions = useMemo(() => {
    return [
      {
        k: 'export',
        title: 'Export My Data',
        sub: 'Download your data as JSON',
        onPress: async () => {
          setBusy(true);
          try {
            const res = await client.get('/privacy/export');
            // In mobile, we show the JSON snippet and let the user copy for now.
            const preview = JSON.stringify(res.data, null, 2).slice(0, 1600);
            Alert.alert('Export ready', preview.length ? preview : 'No data');
          } catch (e) {
            Alert.alert('Error', e?.response?.data?.error || 'Export failed');
          } finally {
            setBusy(false);
          }
        },
      },
      {
        k: 'consent',
        title: 'Voice Consent Records',
        sub: 'View consent status for each loved one',
        onPress: async () => {
          setBusy(true);
          try {
            const res = await client.get('/privacy/consent-records');
            const lines = (res.data?.lovedOnes || []).map((l) => {
              const c = l.consentType || '—';
              const d = l.isDeceased === true ? 'Deceased' : l.isDeceased === false ? 'Alive' : '—';
              const v = l.voiceAccepted === true ? 'Accepted' : l.voiceAccepted === false ? 'Not accepted' : '—';
              return `${l.name} · ${l.relation} · ${d} · consent: ${c} · voice: ${v}`;
            });
            Alert.alert('Consent records', lines.join('\n') || 'No loved ones yet');
          } catch (e) {
            Alert.alert('Error', e?.response?.data?.error || 'Failed to load consent records');
          } finally {
            setBusy(false);
          }
        },
      },
      {
        k: 'delete',
        title: 'Delete All My Data',
        sub: 'Removes voice clones, conversations, blessings',
        danger: true,
        onPress: async () => {
          Alert.alert('Delete everything?', 'This will permanently delete your account and all data.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                setBusy(true);
                try {
                  await client.post('/privacy/delete-all', { confirm: 'DELETE' });
                  Alert.alert('Deleted', 'All data deleted. You will be logged out.');
                } catch (e) {
                  Alert.alert('Error', e?.response?.data?.error || 'Delete failed');
                } finally {
                  setBusy(false);
                }
              },
            },
          ]);
        },
      },
    ];
  }, []);

  const submitReport = async () => {
    const msg = String(reportMessage || '').trim();
    if (msg.length < 5) {
      Alert.alert('Add details', 'Please enter at least 5 characters.');
      return;
    }
    setBusy(true);
    try {
      const res = await client.post('/privacy/report-abuse', {
        message: msg,
        contact: String(reportContact || '').trim() || undefined,
      });
      Alert.alert('Submitted', `Report ID: ${res.data?.reportId || '—'}`);
      setReportMessage('');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to submit report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.h1}>{topic.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>{topic.body}</Text>

        <Text style={styles.section}>Actions</Text>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.k}
            onPress={busy ? undefined : a.onPress}
            activeOpacity={0.75}
            style={[styles.card, a.danger && styles.cardDanger, busy && styles.cardDisabled]}
          >
            <Text style={[styles.cardTitle, a.danger && styles.cardTitleDanger]}>{a.title}</Text>
            <Text style={styles.cardSub}>{a.sub}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.section}>Report abuse</Text>
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>What happened?</Text>
          <TextInput
            value={reportMessage}
            onChangeText={setReportMessage}
            placeholder="Unauthorized voice cloning, harassment, etc."
            placeholderTextColor="rgba(245,240,255,0.35)"
            style={styles.input}
            multiline
          />
          <Text style={[styles.formLabel, { marginTop: 10 }]}>Contact (optional)</Text>
          <TextInput
            value={reportContact}
            onChangeText={setReportContact}
            placeholder="Phone or email"
            placeholderTextColor="rgba(245,240,255,0.35)"
            style={[styles.input, { minHeight: 44 }]}
          />
          <TouchableOpacity
            onPress={busy ? undefined : submitReport}
            activeOpacity={0.75}
            style={[styles.primaryBtn, busy && styles.cardDisabled]}
          >
            <Text style={styles.primaryBtnTxt}>{busy ? 'Please wait…' : 'Submit report'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  top: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 82, 200, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.25)',
    marginRight: 10,
  },
  backTxt: { fontSize: 22, color: COLORS.text, marginTop: -2 },
  h1: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  scroll: { paddingHorizontal: 18, paddingBottom: 28 },
  body: { fontSize: 12.5, color: COLORS.textMuted, lineHeight: 18, marginBottom: 14 },
  section: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 10, marginBottom: 8 },
  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
    marginBottom: 8,
  },
  cardDanger: { borderColor: 'rgba(232, 67, 90, 0.25)' },
  cardDisabled: { opacity: 0.6 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cardTitleDanger: { color: '#E8435A' },
  cardSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
  formCard: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
  },
  formLabel: { fontSize: 11.5, color: COLORS.text, opacity: 0.9, marginBottom: 6 },
  input: {
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 7, 18, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 12.5,
  },
  primaryBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnTxt: { fontSize: 13, fontWeight: '800', color: '#140B24' },
});

