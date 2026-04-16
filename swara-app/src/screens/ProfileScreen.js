import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native';
import { COLORS } from '../utils/constants';
import useStore from '../store/useStore';
import Badge from '../components/ui/Badge';

const APP_VERSION = '1.0.0';

export default function ProfileScreen({ navigation }) {
  const { user, lovedOne, clearStore } = useStore();

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime with your phone number.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearStore();
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        },
      },
    ]);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const phone = user?.phone || '';
  const name = user?.name || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Profile</Text>

        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userPhone}>{phone}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Relationship Depth</Text>
          <View style={styles.depthTop}>
            <Text style={styles.depthLabel}>Depth</Text>
            <Badge text="Recognition" color={COLORS.accent} />
          </View>
          <Text style={styles.depthBody}>
            {lovedOne ? `${lovedOne.totalConversations || 0} conversations with ${lovedOne.name}. The AI is learning your patterns.` : 'Set up a loved one to begin.'}
          </Text>
          <View style={styles.depthTrack}>
            <View style={styles.depthFill} />
          </View>
          <View style={styles.depthStages}>
            {['Foundation', 'Recognition', 'Personality', 'Familiarity', 'Living'].map((s, i) => (
              <Text key={s} style={[styles.stage, i <= 1 ? styles.stageOn : null]}>
                {s}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.list}>
          {[
            { i: '🕐', l: 'Morning Greeting Time', v: '7:00 AM' },
            { i: '🌐', l: 'Language', v: 'Tenglish' },
            { i: '○', l: 'Manage Loved Ones', v: lovedOne ? '1/∞' : '0/∞', onPress: () => navigation.navigate('LovedOneSetup') },
            { i: '🔔', l: 'Notifications', v: 'On' },
            { i: '◈', l: 'Privacy & Data', onPress: () => navigation.navigate('Privacy') },
          ].map((s) => (
            <TouchableOpacity
              key={s.l}
              onPress={s.onPress}
              activeOpacity={0.75}
              style={styles.listRow}
              disabled={!s.onPress}
            >
              <Text style={styles.li}>{s.i}</Text>
              <Text style={styles.ll}>{s.l}</Text>
              {s.v ? <Text style={styles.lv}>{s.v}</Text> : null}
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Swara v{APP_VERSION} · DPDPA Compliant · Built with ♥</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28 },
  h1: { fontSize: 25, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.44)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: COLORS.text, fontWeight: '900', fontSize: 20 },
  userName: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  userPhone: { color: COLORS.textMuted, fontSize: 11.5, marginTop: 2 },

  block: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
    marginBottom: 14,
  },
  blockTitle: { color: COLORS.text, fontWeight: '800', marginBottom: 8 },
  depthTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  depthLabel: { color: 'rgba(245,240,255,0.82)', fontSize: 12, fontWeight: '700' },
  depthBody: { color: 'rgba(155, 142, 196, 0.90)', fontSize: 10.5, lineHeight: 16 },
  depthTrack: { height: 3, backgroundColor: 'rgba(123, 82, 200, 0.22)', borderRadius: 2, marginTop: 10 },
  depthFill: { width: '24%', height: '100%', borderRadius: 2, backgroundColor: COLORS.gold },
  depthStages: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stage: { fontSize: 7.5, color: 'rgba(155, 142, 196, 0.44)' },
  stageOn: { color: COLORS.gold },

  list: {
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.10)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 82, 200, 0.06)',
  },
  li: { width: 22, textAlign: 'center', opacity: 0.6 },
  ll: { flex: 1, color: 'rgba(245,240,255,0.82)', fontSize: 13 },
  lv: { color: 'rgba(155, 142, 196, 0.77)', fontSize: 11 },
  chev: { color: 'rgba(155, 142, 196, 0.33)', fontSize: 12 },

  signOut: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(232, 67, 90, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232, 67, 90, 0.30)',
  },
  signOutTxt: { color: '#FF6B6B', fontWeight: '800' },
  footer: { textAlign: 'center', color: 'rgba(155, 142, 196, 0.55)', fontSize: 9, marginTop: 14 },
});
