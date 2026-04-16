import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Alert } from 'react-native';
import { COLORS } from '../utils/constants';
import useStore from '../store/useStore';
import client from '../api/client';

const HomeScreen = ({ navigation }) => {
  const { user, lovedOne, setConversations } = useStore();
  const [recent, setRecent] = useState([]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const nick = (user?.name && user.name.trim().split(/\s+/)[0]) || 'there';

  const lovedOneName = lovedOne?.name || 'Loved one';
  const lovedOneRelation = lovedOne?.relation || '';

  const morningLabel = useMemo(() => {
    if (!lovedOne?.id) return null;
    return `☀ Morning ఆశీర్వాదం from ${lovedOneName}`;
  }, [lovedOne?.id, lovedOneName]);

  useEffect(() => {
    const load = async () => {
      if (!lovedOne?.id) return;
      try {
        const res = await client.get(`/api/conversation/history/${lovedOne.id}?limit=6`);
        const raw = res.data?.conversations || [];
        const mapped = raw.map((c) => ({
          id: c.id,
          name: lovedOneName,
          when: c.createdAt,
          preview: c.aiResponse || c.userMessage,
          lovedOne: lovedOne,
        }));
        setRecent(mapped);

        // keep store conversation bubbles in sync for the conversation screen
        const bubbles = raw
          .slice()
          .reverse()
          .flatMap((c) => [
            { id: `${c.id}_u`, text: c.userMessage, isUser: true, timestamp: c.createdAt },
            { id: `${c.id}_a`, text: c.aiResponse, isUser: false, timestamp: c.createdAt, audioUrl: c.audioUrl },
          ]);
        setConversations(bubbles);
      } catch {
        // ignore
      }
    };
    load();
  }, [lovedOne?.id, lovedOneName, setConversations, lovedOne]);

  const openConversation = () => {
    if (!lovedOne?.id) {
      Alert.alert('Setup needed', 'Please set up a loved one first.');
      navigation.navigate('Profile');
      return;
    }
    navigation.navigate('Conversation', { lovedOne });
  };

  const openSetup = () => navigation.navigate('LovedOneSetup');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingWrap}>
          <Text style={styles.greetSmall}>{greet},</Text>
          <Text style={styles.greetBig}>
            {nick} <Text style={{ color: COLORS.gold }}>✨</Text>
          </Text>
        </View>

        {/* Morning blessing card */}
        {morningLabel ? (
          <TouchableOpacity style={styles.morningCard} activeOpacity={0.9} onPress={openConversation}>
            <View style={styles.morningOrb} />
            <Text style={styles.morningKicker}>{morningLabel}</Text>
            <Text style={styles.morningQuote} numberOfLines={3}>
              “Bangaaram, ee roju neeku chala manchidi avuthundi. Naa aasheervaadham neetoney untundi.”
            </Text>
            <View style={styles.morningPlayer}>
              <View style={styles.playBtn}>
                <Text style={styles.playTxt}>▶</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.dur}>0:12</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Loved ones */}
        <Text style={styles.sectionLabel}>Your Loved Ones</Text>
        <View style={styles.lovedRow}>
          {lovedOne?.id ? (
            <TouchableOpacity style={styles.lovedCardActive} activeOpacity={0.9} onPress={openConversation}>
              <View style={styles.lovedAvatarRing}>
                <Text style={styles.lovedEmoji}>👴</Text>
              </View>
              <Text style={styles.lovedName} numberOfLines={1}>
                {lovedOneName}
              </Text>
              <Text style={styles.lovedRel} numberOfLines={1}>
                {lovedOneRelation || 'Loved one'}
              </Text>
              <Text style={styles.consentLine}>● Consent verified</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.lovedCard} activeOpacity={0.9} onPress={openSetup}>
              <View style={styles.lovedAvatarRingDim}>
                <Text style={styles.lovedEmoji}>○</Text>
              </View>
              <Text style={styles.lovedName}>Set up a loved one</Text>
              <Text style={styles.lovedRel}>Start here</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.addCard} activeOpacity={0.85} onPress={openSetup}>
            <Text style={styles.addPlus}>+</Text>
            <Text style={styles.addLbl}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Recents */}
        <Text style={styles.sectionLabel}>Recent Conversations</Text>
        {recent.length === 0 ? (
          <TouchableOpacity style={styles.emptyRecent} activeOpacity={0.85} onPress={openConversation}>
            <Text style={styles.emptyRecentTitle}>No conversations yet</Text>
            <Text style={styles.emptyRecentSub}>Tap to start your first conversation.</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 8 }}>
            {recent.map((c) => (
              <TouchableOpacity key={c.id} style={styles.recentRow} activeOpacity={0.85} onPress={openConversation}>
                <View style={styles.recentAvatar}>
                  <Text style={styles.recentEmoji}>👴</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.recentTop}>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {lovedOneName}
                    </Text>
                    <Text style={styles.recentWhen} numberOfLines={1}>
                      {''}
                    </Text>
                  </View>
                  <Text style={styles.recentPreview} numberOfLines={1}>
                    {c.preview}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 22 },
  greetingWrap: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  greetSmall: { fontSize: 13, color: COLORS.textMuted, fontWeight: '300' },
  greetBig: { fontSize: 27, color: COLORS.text, fontWeight: '800', marginTop: 2 },

  morningCard: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(61, 32, 128, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    overflow: 'hidden',
  },
  morningOrb: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  morningKicker: { fontSize: 11, color: COLORS.gold, fontWeight: '800', marginBottom: 8 },
  morningQuote: { fontSize: 13.5, color: 'rgba(245,240,255,0.88)', lineHeight: 22, fontStyle: 'italic' },
  morningPlayer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.33)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTxt: { color: COLORS.gold, fontSize: 12, fontWeight: '800' },
  progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(123, 82, 200, 0.33)', borderRadius: 2 },
  progressFill: { width: '35%', height: '100%', backgroundColor: COLORS.gold, borderRadius: 2 },
  dur: { fontSize: 10, color: 'rgba(155, 142, 196, 0.88)' },

  sectionLabel: { paddingHorizontal: 24, fontSize: 12, color: COLORS.textMuted, marginBottom: 8, marginTop: 4 },
  lovedRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24 },
  lovedCardActive: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(61, 32, 128, 0.40)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.44)',
  },
  lovedCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1.5,
    borderColor: 'rgba(123, 82, 200, 0.18)',
  },
  lovedAvatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.66)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  lovedAvatarRingDim: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(123, 82, 200, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(123, 82, 200, 0.33)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  lovedEmoji: { fontSize: 18, color: COLORS.text },
  lovedName: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  lovedRel: { fontSize: 9.5, color: 'rgba(155, 142, 196, 0.88)', marginTop: 2 },
  consentLine: { fontSize: 8, color: COLORS.green, marginTop: 4, fontWeight: '700' },
  addCard: {
    width: 55,
    borderRadius: 15,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(123, 82, 200, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addPlus: { fontSize: 20, color: 'rgba(123, 82, 200, 0.55)', fontWeight: '300' },
  addLbl: { fontSize: 9, color: 'rgba(155, 142, 196, 0.55)', marginTop: 4 },

  emptyRecent: {
    marginHorizontal: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.10)',
  },
  emptyRecentTitle: { color: COLORS.text, fontWeight: '800' },
  emptyRecentSub: { color: COLORS.textMuted, marginTop: 4, fontSize: 12 },
  recentRow: {
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  recentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(123, 82, 200, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentEmoji: { fontSize: 16 },
  recentTop: { flexDirection: 'row', justifyContent: 'space-between' },
  recentName: { color: COLORS.text, fontSize: 12.5, fontWeight: '700' },
  recentWhen: { color: 'rgba(155, 142, 196, 0.77)', fontSize: 10 },
  recentPreview: { color: 'rgba(155, 142, 196, 0.90)', fontSize: 11.5, marginTop: 2 },
});

export default HomeScreen;
