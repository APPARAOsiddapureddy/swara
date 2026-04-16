import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { COLORS, API_URL } from '../utils/constants';
import client from '../api/client';
import useStore from '../store/useStore';
import Header from '../components/ui/Header';
import ProgressBar from '../components/ui/ProgressBar';
import Btn from '../components/ui/Btn';
import Input from '../components/ui/Input';
import CheckRow from '../components/ui/CheckRow';

const TOTAL_STEPS = 4;
const RELATIONS_DAY1 = ['Grandparent', 'Parent'];
// Future: add more relationships when backend prompt rules expand.
const SPEAK_OPTIONS = [
  { id: 'pure_telugu', label: 'Pure Telugu' },
  { id: 'tenglish', label: 'Tenglish' },
  { id: 'andhra', label: 'Andhra dialect' },
  { id: 'telangana', label: 'Telangana dialect' },
];
const VALUE_CHIPS = [
  'Family',
  'Hard work',
  'Education',
  'Honesty',
  'Spirituality',
  'Independence',
  'Kindness',
  'Courage',
];
const SUPPORT_OPTIONS = [
  { id: 'Direct Encourager', label: 'Direct · “You can do this.”' },
  { id: 'Thoughtful Advisor', label: 'Thoughtful · guided, not rushed' },
  { id: 'Gentle Nurturer', label: 'Gentle · safe space' },
  { id: 'Tough Love', label: 'Tough love · pushed you to grow' },
];

export default function LovedOneSetupScreen({ navigation, route }) {
  const { setLovedOne } = useStore();
  const soundRef = useRef(null);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [draftLovedOneId, setDraftLovedOneId] = useState(null);

  const [lovedOneName, setLovedOneName] = useState('');
  const [relation, setRelation] = useState('');
  const [nickname, setNickname] = useState('');
  const [dialectId, setDialectId] = useState('');
  const [isDeceased, setIsDeceased] = useState(null);

  const [deceasedAck1, setDeceasedAck1] = useState(false);
  const [deceasedAck2, setDeceasedAck2] = useState(false);
  const [deceasedAck3, setDeceasedAck3] = useState(false);
  const [aliveMethod, setAliveMethod] = useState(null);
  const [voiceFile, setVoiceFile] = useState(null);

  // Step 2 UI matches the web mock: allow toggling between deceased/alive panels.
  const [consentTab, setConsentTab] = useState('deceased');

  const [phrases, setPhrases] = useState(['']);
  const [values, setValues] = useState([]);
  const [supportStyle, setSupportStyle] = useState('');
  const [belief, setBelief] = useState('');
  const [memory, setMemory] = useState('');

  useEffect(() => {
    if (route?.params?.continueFromPreview) {
      setStep(2);
      navigation.setParams({ continueFromPreview: undefined, voiceAccepted: undefined });
    }
  }, [route?.params?.continueFromPreview, navigation, route?.params]);

  useEffect(() => {
    if (isDeceased === true) setConsentTab('deceased');
    if (isDeceased === false) setConsentTab('alive');
  }, [isDeceased]);

  const consentTypeValue = () => {
    if (isDeceased) return 'deceased_family_declaration';
    if (aliveMethod === 'link') return 'alive_consent_link';
    if (aliveMethod === 'together') return 'alive_record_together';
    if (aliveMethod === 'self') return 'alive_self_declare';
    return 'unknown';
  };

  const canContinueStep1 = useMemo(
    () => Boolean(lovedOneName.trim() && relation && nickname.trim() && dialectId && isDeceased !== null),
    [dialectId, isDeceased, lovedOneName, nickname, relation]
  );

  const pickVoiceFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setVoiceFile(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'There was a problem selecting the file. Please try again.');
    }
  };

  const clearVoice = () => setVoiceFile(null);

  const previewLocalVoice = async () => {
    if (!voiceFile?.uri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: voiceFile.uri }, { shouldPlay: true });
      soundRef.current = sound;
    } catch {
      Alert.alert('Error', 'Could not play this audio file.');
    }
  };

  const addPhrase = () => {
    if (phrases.length < 5) setPhrases([...phrases, '']);
  };
  const updatePhrase = (i, text) => {
    const next = [...phrases];
    next[i] = text;
    setPhrases(next);
  };
  const toggleValue = (v) => {
    setValues((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const ensureDraftLovedOne = async () => {
    let lovedOneId = draftLovedOneId;
    if (lovedOneId) return lovedOneId;

    const payload = {
      name: lovedOneName.trim(),
      relation,
      nickname: nickname.trim(),
      dialect: dialectId,
      values: [],
      phrases: ['—'],
      supportStyle: 'Direct Encourager',
      beliefText: '(Completing next steps)',
      memoryText: '(Completing next steps)',
      profileComplete: false,
      isDeceased,
      consentType: consentTypeValue(),
    };
    const res = await client.post('/api/loved-one/create', payload);
    lovedOneId = res.data.lovedOne?.id;
    if (!lovedOneId) throw new Error('No loved one id');
    setDraftLovedOneId(lovedOneId);
    return lovedOneId;
  };

  const buildPreview = async () => {
    if (isDeceased) {
      if (!deceasedAck1 || !deceasedAck2 || !deceasedAck3) {
        Alert.alert('Required', 'Please confirm all declarations before continuing.');
        return;
      }
    } else if (!aliveMethod) {
      Alert.alert('Required', 'Please choose how consent will be recorded.');
      return;
    }
    if (!voiceFile) {
      Alert.alert('Required', 'Please upload a voice sample to continue.');
      return;
    }

    setLoading(true);
    try {
      const lovedOneId = await ensureDraftLovedOne();

      const formData = new FormData();
      if (Platform.OS === 'web') {
        // On web, FormData must contain a real File/Blob, not a React Native { uri, name, type } object.
        const file =
          voiceFile?.file ||
          (typeof File !== 'undefined' && voiceFile instanceof File ? voiceFile : null);
        if (file) {
          formData.append('audio', file, file.name || voiceFile.name || 'voice');
        } else if (voiceFile?.uri) {
          const resp = await fetch(voiceFile.uri);
          const blob = await resp.blob();
          formData.append('audio', blob, voiceFile.name || 'voice');
        } else {
          throw new Error('Could not read selected file on web.');
        }
      } else {
        formData.append('audio', {
          uri: voiceFile.uri,
          name: voiceFile.name || 'voice.m4a',
          type: voiceFile.mimeType || 'audio/m4a',
        });
      }
      await client.post(`/api/loved-one/${lovedOneId}/upload-voice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const prevRes = await client.post(`/api/loved-one/${lovedOneId}/preview-greeting`);
      const previewText = prevRes.data.text || '';
      let url = prevRes.data.audioUrl || '';
      if (url && !url.startsWith('http')) {
        url = `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      navigation.navigate('VoicePreview', {
        lovedOneId,
        previewText,
        previewAudioUrl: url,
      });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Could not process voice. Please try again.';
      Alert.alert('Error', String(msg));
    } finally {
      setLoading(false);
    }
  };

  const finalize = async () => {
    if (!belief.trim() || !memory.trim()) {
      Alert.alert('Required', 'Please fill in both fields to continue.');
      return;
    }
    if (!draftLovedOneId) {
      Alert.alert('Error', 'Setup state lost. Please start again from Consent & Voice.');
      return;
    }

    setLoading(true);
    try {
      const res = await client.put(`/api/loved-one/${draftLovedOneId}`, {
        phrases: phrases.map((p) => p.trim()).filter(Boolean),
        values,
        supportStyle,
        beliefText: belief.trim(),
        memoryText: memory.trim(),
        profileComplete: true,
      });
      const updated = res.data.lovedOne;
      setLovedOne(updated);
      Alert.alert('✓ Created', `${lovedOneName.trim()}'s Swara is ready. Start your first conversation.`, [
        { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) },
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || 'There was a problem creating your Swara. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <View style={styles.body}>
          <Text style={styles.h1}>Who do you want to speak with?</Text>
          <Text style={styles.sub}>Tell us about the person you want to bring to Swara.</Text>

          <Input
            label="Their name"
            placeholder="e.g. Raju, Amma, Priya"
            value={lovedOneName}
            onChangeText={setLovedOneName}
          />

          <Text style={styles.label}>Relationship</Text>
          <View style={styles.relGrid}>
            {RELATIONS_DAY1.map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => setRelation(l)}
                activeOpacity={0.8}
                style={[styles.relChip, relation === l && styles.relChipOn]}
              >
                <Text style={[styles.relTxt, relation === l && styles.relTxtOn]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="What did they call you?"
            placeholder="e.g. Bangaaram, Chintu, Beta"
            value={nickname}
            onChangeText={setNickname}
          />

          <Text style={styles.label}>How did they speak?</Text>
          <View style={{ gap: 8 }}>
            {SPEAK_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o.id}
                onPress={() => setDialectId(o.id)}
                activeOpacity={0.8}
                style={[styles.card, dialectId === o.id && styles.cardOn]}
              >
                <Text style={[styles.cardTxt, dialectId === o.id && styles.cardTxtOn]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 6 }]}>Is this person still with us?</Text>
          <View style={styles.row2}>
            <TouchableOpacity
              onPress={() => setIsDeceased(false)}
              activeOpacity={0.85}
              style={[styles.half, isDeceased === false && styles.halfAlive]}
            >
              <Text style={[styles.halfTxt, isDeceased === false && styles.halfTxtOn]}>Yes, they are alive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsDeceased(true)}
              activeOpacity={0.85}
              style={[styles.half, isDeceased === true && styles.halfGone]}
            >
              <Text style={[styles.halfTxt, isDeceased === true && styles.halfTxtOn]}>No, they have passed</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (step === 1) {
      return (
        <View style={styles.body}>
          <Text style={styles.h1}>Consent & Voice</Text>

          <View style={styles.tabRow}>
            {[
              { k: 'deceased', l: 'Deceased' },
              { k: 'alive', l: 'Alive' },
            ].map((t) => {
              const on = consentTab === t.k;
              return (
                <TouchableOpacity
                  key={t.k}
                  onPress={() => {
                    setConsentTab(t.k);
                    setIsDeceased(t.k === 'deceased');
                  }}
                  activeOpacity={0.85}
                  style={[styles.tabChip, on && styles.tabChipOn]}
                >
                  <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{t.l} person</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {consentTab === 'deceased' ? (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoTxt}>
                  We understand they are no longer with us. To honor their memory responsibly, please confirm:
                </Text>
              </View>
              <CheckRow
                checked={deceasedAck1}
                onToggle={() => setDeceasedAck1(!deceasedAck1)}
                label="I am a direct family member (child, grandchild, sibling, or spouse)."
              />
              <CheckRow
                checked={deceasedAck2}
                onToggle={() => setDeceasedAck2(!deceasedAck2)}
                label="I have the right to use this voice recording and no other family member has objected."
              />
              <CheckRow
                checked={deceasedAck3}
                onToggle={() => setDeceasedAck3(!deceasedAck3)}
                label="I understand Swara uses AI to recreate warmth. This is a companion experience, not a replacement."
              />
              <View style={styles.legalCard}>
                <Text style={styles.legalTxt}>
                  🔒 This declaration is stored as your consent record under DPDPA 2023.
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.infoCard, styles.infoCardAlive]}>
                <Text style={styles.infoTxt}>Since your loved one is alive, we need their voice consent:</Text>
              </View>
              {[
                { id: 'link', icon: '🔗', title: 'Share consent link', sub: 'Send a link — they record a 5-second voice permission.' },
                { id: 'together', icon: '🎙', title: 'Record together', sub: 'Record them saying the consent statement in person.' },
                { id: 'self', icon: '✓', title: 'Self-declare', sub: 'You confirm they consent. You accept legal responsibility.' },
              ].map((o) => (
                <TouchableOpacity
                  key={o.id}
                  onPress={() => setAliveMethod(o.id)}
                  activeOpacity={0.85}
                  style={[styles.consentRow, aliveMethod === o.id && styles.consentRowOn]}
                >
                  <View style={styles.consentIcon}>
                    <Text style={{ fontSize: 16 }}>{o.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.consentTitle}>{o.title}</Text>
                    <Text style={styles.consentSub}>{o.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <Text style={[styles.h2, { marginTop: 18 }]}>Upload their voice</Text>
          <Text style={styles.sub2}>We need 30–60 seconds. A WhatsApp voice note, video clip, or any recording works.</Text>

          <TouchableOpacity onPress={pickVoiceFile} activeOpacity={0.85} style={styles.uploadBox}>
            {voiceFile ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.fileOk}>✓ {voiceFile.name}</Text>
                <View style={styles.fileActions}>
                  <TouchableOpacity onPress={previewLocalVoice} activeOpacity={0.7}>
                    <Text style={styles.link}>Preview</Text>
                  </TouchableOpacity>
                  <Text style={styles.dot}> · </Text>
                  <TouchableOpacity onPress={clearVoice} activeOpacity={0.7}>
                    <Text style={styles.link}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28, opacity: 0.7 }}>🎙</Text>
                <Text style={styles.uploadTap}>Tap to upload audio file</Text>
                <Text style={styles.uploadFmt}>.mp3, .m4a, .wav — max 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.smallNote}>
            By uploading, you confirm this recording was made with consent or you have family authorization.
          </Text>
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.body}>
          <Text style={styles.h1}>Personality & Values</Text>
          <Text style={styles.sub}>These details make their AI feel authentic.</Text>

          <Text style={styles.label}>Their signature phrases (3–5)</Text>
          {phrases.map((p, i) => (
            <Input
              key={i}
              placeholder="Enter a phrase they often said"
              value={p}
              onChangeText={(t) => updatePhrase(i, t)}
              style={{ marginBottom: 10 }}
            />
          ))}
          {phrases.length < 5 ? (
            <TouchableOpacity onPress={addPhrase} activeOpacity={0.85} style={styles.addPhrase}>
              <Text style={styles.addPhraseTxt}>+ Add phrase</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={[styles.label, { marginTop: 14 }]}>Their core values</Text>
          <View style={styles.valueWrap}>
            {VALUE_CHIPS.map((v) => {
              const on = values.includes(v);
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => toggleValue(v)}
                  activeOpacity={0.85}
                  style={[styles.valueChip, on && styles.valueChipOn]}
                >
                  <Text style={[styles.valueTxt, on && styles.valueTxtOn]}>{v}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>How did they support you?</Text>
          <View style={styles.supportGrid}>
            {SUPPORT_OPTIONS.map((o) => {
              const on = supportStyle === o.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  onPress={() => setSupportStyle(o.id)}
                  activeOpacity={0.85}
                  style={[styles.supportCard, on && styles.supportCardOn]}
                >
                  <Text style={[styles.supportTxt, on && styles.supportTxtOn]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.body}>
        <Text style={styles.h1}>Their Belief in You</Text>
        <Text style={styles.sub}>This is what makes their AI truly yours.</Text>

        <Input
          label="What did they believe you were capable of?"
          placeholder="What did they always say you could become or achieve?"
          value={belief}
          onChangeText={setBelief}
          multiline
          inputStyle={styles.multiInput}
        />

        <Input
          label="One memory where they made you feel completely believed in"
          placeholder="Describe a specific moment — what happened, what they said, how it made you feel."
          value={memory}
          onChangeText={setMemory}
          multiline
          inputStyle={styles.multiInput}
        />

        <View style={{ marginTop: 8 }}>
          <Btn onPress={finalize} disabled={loading}>
            {loading ? 'Creating…' : `✨ Bring ${lovedOneName.trim() || 'them'} to Life`}
          </Btn>
        </View>
      </View>
    );
  };

  const footer = () => {
    if (step === 0) {
      return (
        <View style={styles.footer}>
          <Btn
            onPress={() =>
              canContinueStep1
                ? setStep(1)
                : Alert.alert('Required', 'Please complete all fields before continuing.')
            }
          >
            Next → Consent & Voice
          </Btn>
        </View>
      );
    }
    if (step === 1) {
      return (
        <View style={styles.footer}>
          <Btn onPress={buildPreview} disabled={loading}>
            {loading ? 'Uploading & cloning…' : 'Build preview'}
          </Btn>
        </View>
      );
    }
    if (step === 2) {
      return (
        <View style={styles.footer}>
          <Btn
            onPress={() => {
              const filled = phrases.map((p) => p.trim()).filter(Boolean);
              if (filled.length === 0 || !supportStyle) {
                Alert.alert('Required', 'Add at least one phrase and choose how they supported you.');
                return;
              }
              setStep(3);
            }}
          >
            Next → Their Belief in You
          </Btn>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Header
          back={step > 0}
          title="Create Loved One"
          onBack={goBack}
          right={<Text style={styles.stepBadge}>Step {step + 1} of {TOTAL_STEPS}</Text>}
        />
        <ProgressBar step={step + 1} total={TOTAL_STEPS} />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {renderStep()}
          {loading && step === 1 ? <ActivityIndicator style={{ marginTop: 14 }} color={COLORS.gold} /> : null}
        </ScrollView>
        {footer()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 18 },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 10 },

  body: { paddingTop: 6 },
  stepBadge: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  h1: { fontSize: 23, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  h2: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 18 },
  sub2: { fontSize: 12.5, color: COLORS.textMuted, lineHeight: 18, marginBottom: 12 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8, fontWeight: '600' },

  relGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  relChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.22)',
    minWidth: 98,
    alignItems: 'center',
  },
  relChipOn: { backgroundColor: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.44)' },
  relTxt: { fontSize: 11.5, color: COLORS.mid, fontWeight: '600' },
  relTxtOn: { color: COLORS.gold },
  relTxtDisabled: { color: 'rgba(168,155,194,0.55)' },

  card: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
  },
  cardOn: { borderColor: 'rgba(212, 175, 55, 0.44)', backgroundColor: 'rgba(212, 175, 55, 0.10)' },
  cardTxt: { color: COLORS.text, fontWeight: '700' },
  cardTxtOn: { color: COLORS.gold },

  row2: { flexDirection: 'row', gap: 10, marginTop: 4 },
  half: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    alignItems: 'center',
  },
  halfAlive: { borderColor: 'rgba(76, 175, 80, 0.35)', backgroundColor: 'rgba(76, 175, 80, 0.10)' },
  halfGone: { borderColor: 'rgba(123, 82, 200, 0.35)', backgroundColor: 'rgba(123, 82, 200, 0.10)' },
  halfTxt: { color: COLORS.mid, fontSize: 12, textAlign: 'center' },
  halfTxtOn: { color: COLORS.text, fontWeight: '700' },

  infoCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(123, 82, 200, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    marginBottom: 10,
  },
  infoCardAlive: { backgroundColor: 'rgba(76, 175, 80, 0.08)', borderColor: 'rgba(76, 175, 80, 0.22)' },
  infoTxt: { color: 'rgba(245,240,255,0.86)', lineHeight: 20 },
  legalCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  legalTxt: { fontSize: 10.5, color: 'rgba(212,175,55,0.8)', lineHeight: 16 },

  consentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 13,
    borderRadius: 13,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    marginBottom: 8,
  },
  consentRowOn: { borderColor: 'rgba(212, 175, 55, 0.44)', backgroundColor: 'rgba(212, 175, 55, 0.10)' },
  consentIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(123, 82, 200, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentTitle: { color: COLORS.text, fontWeight: '700' },
  consentSub: { color: 'rgba(168,155,194,0.78)', fontSize: 11, lineHeight: 16, marginTop: 3 },

  tabRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 0, marginBottom: 10, marginTop: 4 },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
    backgroundColor: 'transparent',
  },
  tabChipOn: { backgroundColor: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.44)' },
  tabTxt: { fontSize: 12, color: 'rgba(155, 142, 196, 0.75)', fontWeight: '600' },
  tabTxtOn: { color: COLORS.gold, fontWeight: '800' },

  uploadBox: {
    padding: 22,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(123, 82, 200, 0.33)',
    backgroundColor: COLORS.cardGlass,
    alignItems: 'center',
  },
  uploadTap: { marginTop: 8, color: COLORS.text, fontWeight: '700' },
  uploadFmt: { marginTop: 4, color: 'rgba(168,155,194,0.78)', fontSize: 11 },
  fileOk: { color: COLORS.text, fontWeight: '700', textAlign: 'center' },
  fileActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  link: { color: COLORS.gold, fontWeight: '700' },
  dot: { color: COLORS.textMuted },
  smallNote: { marginTop: 10, fontSize: 10.5, color: 'rgba(168,155,194,0.7)', lineHeight: 16 },

  addPhrase: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.22)',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 14,
  },
  addPhraseTxt: { color: COLORS.gold, fontWeight: '700' },

  valueWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valueChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
  },
  valueChipOn: { backgroundColor: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.44)' },
  valueTxt: { color: 'rgba(168,155,194,0.9)', fontWeight: '700', fontSize: 12 },
  valueTxtOn: { color: COLORS.gold },

  supportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  supportCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
  },
  supportCardOn: { borderColor: 'rgba(212, 175, 55, 0.44)', backgroundColor: 'rgba(212, 175, 55, 0.12)' },
  supportTxt: { color: 'rgba(245,240,255,0.85)', fontWeight: '700', fontSize: 12 },
  supportTxtOn: { color: COLORS.gold },

  multiInput: { minHeight: 90 },
});

