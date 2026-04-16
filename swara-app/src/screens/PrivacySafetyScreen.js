import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { COLORS } from '../utils/constants';

const Row = ({ icon, title, subtitle, danger, onPress, toggleOn }) => (
  <TouchableOpacity
    style={[styles.row, danger && styles.rowDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.rowIcon}>{icon}</Text>
    <View style={styles.rowTextWrap}>
      <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
      {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
    </View>
    {toggleOn ? (
      <View style={styles.toggle}>
        <View style={styles.toggleKnob} />
      </View>
    ) : (
      <Text style={styles.chev}>›</Text>
    )}
  </TouchableOpacity>
);

const PrivacySafetyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>◈ Privacy & Safety</Text>
        <Text style={styles.sub}>Your data is sacred. You control everything.</Text>

        <View style={styles.badgeCard}>
          <Text style={styles.badgeTitle}>✓ DPDPA 2023 Compliant</Text>
          <Text style={styles.badgeBody}>
            Swara follows India’s Digital Personal Data Protection Act. Your rights are protected by law.
          </Text>
        </View>

        <Row
          icon="🔐"
          title="Data Encryption"
          subtitle="AES-256 at rest · TLS 1.3 in transit"
          onPress={() => navigation.navigate('PrivacyDetail', { topic: 'encryption' })}
          toggleOn
        />
        <Row
          icon="🗑"
          title="Delete All My Data"
          subtitle="Removes voice clones, conversations, blessings"
          danger
          onPress={() => navigation.navigate('PrivacyDetail', { topic: 'privacy' })}
        />
        <Row
          icon="📦"
          title="Export My Data"
          subtitle="Download all your data as JSON"
          onPress={() => navigation.navigate('PrivacyDetail', { topic: 'privacy' })}
        />
        <Row
          icon="🎙"
          title="Voice Consent Records"
          subtitle="View consent status for each loved one"
          onPress={() => navigation.navigate('PrivacyDetail', { topic: 'privacy' })}
        />
        <Row
          icon="🔔"
          title="Data Processing Consent"
          subtitle="Manage what data is used for AI, memory, greetings"
          onPress={() => navigation.navigate('PrivacyDetail', { topic: 'privacy' })}
        />

        <TouchableOpacity
          style={styles.reportRow}
          onPress={() => navigation.navigate('PrivacyDetail', { topic: 'privacy' })}
          activeOpacity={0.7}
        >
          <Text style={styles.rowIcon}>⚠️</Text>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.rowTitle, { color: COLORS.gold }]}>Report Abuse</Text>
            <Text style={styles.rowSub}>Unauthorized voice cloning · 24hr response</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 6 }}>
          {['Privacy Policy', 'Terms of Service', 'How Your Voice Data Is Used', 'Mental Health Resources'].map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => {
                if (l === 'Mental Health Resources') {
                  Linking.openURL('https://www.mhanational.org/mental-health-screening-tools').catch(() => {});
                } else if (l === 'Privacy Policy') navigation.navigate('PrivacyDetail', { topic: 'privacy' });
                else if (l === 'Terms of Service') navigation.navigate('PrivacyDetail', { topic: 'terms' });
                else if (l === 'How Your Voice Data Is Used') navigation.navigate('PrivacyDetail', { topic: 'voice' });
              }}
              activeOpacity={0.75}
              style={styles.linkRow}
            >
              <Text style={styles.linkRowTxt}>{l}</Text>
              <Text style={styles.linkRowChev}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  h1: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sub: { fontSize: 12.5, color: COLORS.textMuted, marginBottom: 16, lineHeight: 18 },
  badgeCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.35)',
    marginBottom: 14,
  },
  badgeTitle: { fontSize: 13, fontWeight: '600', color: '#4CAF50', marginBottom: 4 },
  badgeBody: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
    marginBottom: 8,
  },
  rowDanger: { borderColor: 'rgba(232, 67, 90, 0.25)' },
  rowIcon: { fontSize: 18, width: 32, textAlign: 'center' },
  rowTextWrap: { flex: 1, paddingRight: 8 },
  rowTitle: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  rowTitleDanger: { color: '#E8435A' },
  rowSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, lineHeight: 16 },
  chev: { fontSize: 14, color: COLORS.textMuted },
  toggle: {
    width: 34,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff' },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.15)',
    marginTop: 8,
    marginBottom: 16,
  },
  linkRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 82, 200, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkRowTxt: { fontSize: 13, color: 'rgba(245,240,255,0.82)' },
  linkRowChev: { fontSize: 14, color: 'rgba(155, 142, 196, 0.55)' },
});

export default PrivacySafetyScreen;
