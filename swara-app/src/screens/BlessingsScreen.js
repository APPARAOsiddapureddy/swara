import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../utils/constants';
import useStore from '../store/useStore';
import client from '../api/client';
import { playAudio } from '../utils/audio';

const BlessingsScreen = () => {
  const { blessings, setBlessings, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetchBlessings();
  }, [user?.subscriptionTier]);

  const fetchBlessings = async () => {
    try {
      setLoading(true);
      const response = await client.get('/api/blessing/list');
      const data = response.data?.blessings || response.data || [];
      setBlessings(data);
    } catch (error) {
      console.error('fetchBlessings error:', error);
      // Don't show error on first load if offline — use cached state
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (blessing) => {
    if (!blessing.audioUrl) {
      Alert.alert('Unavailable', 'Audio is not available for this blessing.');
      return;
    }

    try {
      setPlayingId(blessing.id);
      await playAudio(blessing.audioUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not play this audio.');
    } finally {
      setPlayingId(null);
    }
  };

  const items = useMemo(() => blessings || [], [blessings]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.h1}>✦ Saved ఆశీర్వాదం</Text>
        <Text style={styles.sub}>Your collection of blessings — replay anytime</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingTxt}>Loading…</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No blessings saved yet</Text>
            <Text style={styles.emptySub}>
              When you receive an ఆశీర్వాదం that moves you, save it here to replay anytime.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {items.map((b) => {
              const fromName = b.lovedOne?.name || b.lovedOneName || '';
              const isPlaying = playingId === b.id;
              return (
                <View key={b.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {b.title || 'Saved blessing'}
                      </Text>
                      {fromName ? <Text style={styles.from}>from {fromName}</Text> : null}
                      <Text style={styles.date}>{b.createdAt ? String(new Date(b.createdAt).toDateString()) : ''}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.play}
                      onPress={() => handlePlay(b)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.playTxt}>{isPlaying ? '■' : '▶'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.track} />
                    <Text style={styles.dur}>0:—</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  h1: { fontSize: 25, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 3 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  loading: { paddingVertical: 30, alignItems: 'center' },
  loadingTxt: { color: COLORS.textMuted, fontWeight: '700' },
  empty: { paddingVertical: 50, alignItems: 'center' },
  emptyTitle: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  emptySub: { color: COLORS.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 18 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  from: { color: COLORS.gold, fontSize: 11, marginTop: 2, fontWeight: '700' },
  date: { color: 'rgba(155, 142, 196, 0.77)', fontSize: 10, marginTop: 2 },
  play: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.33)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTxt: { color: COLORS.gold, fontWeight: '900' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  track: { flex: 1, height: 3, backgroundColor: 'rgba(123, 82, 200, 0.22)', borderRadius: 2 },
  dur: { color: 'rgba(155, 142, 196, 0.66)', fontSize: 10 },
});

export default BlessingsScreen;
