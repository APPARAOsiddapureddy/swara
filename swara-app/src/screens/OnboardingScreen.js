import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Dimensions, ScrollView, Platform } from 'react-native';
import { COLORS } from '../utils/constants';
import Wave from '../components/ui/Wave';
import Btn from '../components/ui/Btn';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'voice',
    icon: '♥',
    sub: 'Voice',
    tint: COLORS.gold,
    title: 'Hear their voice again',
    body: "Speak with an AI companion in your loved one's voice, their language, their warmth.",
  },
  {
    key: 'privacy',
    icon: '◈',
    sub: 'Privacy',
    tint: COLORS.green,
    title: 'Your data is sacred',
    body: 'Consent-first. You control everything. Delete anytime.',
  },
  {
    key: 'blessing',
    icon: '✦',
    sub: 'Blessing',
    tint: COLORS.gold,
    title: 'Their ఆశీర్వాదం, every day',
    body: 'A calm flow to bring their voice to life — step by step.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index && i >= 0 && i < SLIDES.length) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      navigation.navigate('Login', { mode: 'register' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.brandRow}>
        <Wave size={30} />
        <Text style={styles.logo}>SWARA</Text>
        <Text style={styles.mark}>స్వర</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.pager}
      >
        {SLIDES.map((s) => (
          <View key={s.key} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { borderColor: `${s.tint}22` }]}>
              <Text style={styles.iconEmoji}>{s.icon}</Text>
            </View>
            <Text style={[styles.kicker, { color: s.tint }]}>{s.sub}</Text>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Btn onPress={goNext}>{index < SLIDES.length - 1 ? 'Next' : 'Get Started'}</Btn>
        {index === SLIDES.length - 1 ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { mode: 'login' })}
            style={styles.secondaryWrap}
            activeOpacity={0.75}
          >
            <Text style={styles.secondary}>
              Already have an account? <Text style={styles.secondaryBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...Platform.select({ web: { minHeight: '100vh' }, default: {} }),
  },
  brandRow: { alignItems: 'center', paddingTop: 12, paddingBottom: 6, gap: 6 },
  logo: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: 14, marginTop: 8 },
  mark: { fontSize: 15, color: COLORS.accent, opacity: 0.9, fontStyle: 'italic', marginTop: -2 },
  pager: { flexGrow: 0 },
  slide: { paddingHorizontal: 34, paddingTop: 24, alignItems: 'center' },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.cardGlass,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  iconEmoji: { fontSize: 34, color: COLORS.text },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  title: { fontSize: 27, fontWeight: '800', color: COLORS.text, textAlign: 'center', lineHeight: 34, marginBottom: 12 },
  body: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(123, 82, 200, 0.4)' },
  dotActive: { width: 28, backgroundColor: COLORS.gold },
  footer: { paddingHorizontal: 28, paddingBottom: 28, gap: 16 },
  secondaryWrap: { alignItems: 'center' },
  secondary: { color: COLORS.textMuted, fontSize: 13 },
  secondaryBold: { color: COLORS.gold, fontWeight: '800' },
});

