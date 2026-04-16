import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { COLORS, API_URL } from '../utils/constants';
import client from '../api/client';
import useStore from '../store/useStore';
import Wave from '../components/ui/Wave';
import Btn from '../components/ui/Btn';
import Input from '../components/ui/Input';

export default function LoginScreen({ navigation, route }) {
  const initialMode = route?.params?.mode || 'login';
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser, setToken, setLovedOne } = useStore();

  useEffect(() => {
    if (route?.params?.mode) setMode(route.params.mode);
  }, [route?.params?.mode]);

  const handleSubmit = async () => {
    if (!phone.trim() || !otp.trim()) {
      Alert.alert('Error', 'Please enter your phone number and OTP.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    if (otp.trim() !== '0000') {
      Alert.alert('Error', 'For testing, OTP is 0000.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? { phone, otp } : { name, phone, otp };
      const response = await client.post(endpoint, payload);
      const { token, user, lovedOne: userLovedOne } = response.data;

      setToken(token);
      setUser(user);

      if (userLovedOne) {
        setLovedOne(userLovedOne);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'LovedOneSetup' }] });
      }
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
      const noResponse = !error?.response;
      const timedOut = error?.code === 'ECONNABORTED';

      let message;
      if (status === 401) {
        message = 'Invalid phone number or OTP.';
      } else if (serverMsg) {
        message = String(serverMsg);
      } else if (timedOut) {
        message = 'Request timed out. Check your network and that the backend is running.';
      } else if (noResponse) {
        message =
          typeof __DEV__ !== 'undefined' && __DEV__
            ? `Cannot reach API (${API_URL}). If you deployed backend (Render), set EXPO_PUBLIC_API_URL to your Render URL (or set expo.extra.defaultApiUrl in app.json).`
            : 'Could not connect to server. Please try again later.';
      } else {
        message = 'Could not connect to server. Please try again later.';
      }

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Wave size={44} />
            <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
          </View>

          <View style={styles.card}>
            {mode === 'register' ? (
              <Input
                label="Full name"
                icon="○"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            ) : null}

            <Input
              label="Phone number"
              icon="✆"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <Input
              label="OTP"
              icon="◈"
              placeholder="0000"
              value={otp}
              onChangeText={(t) => setOtp(String(t || '').replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              autoCapitalize="none"
            />

            <Btn onPress={handleSubmit} disabled={loading}>
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating…') : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Btn>

            {mode === 'register' ? (
              <Text style={styles.consent}>
                By creating an account, you agree to our <Text style={styles.link}>Terms</Text> and{' '}
                <Text style={styles.link}>Privacy</Text>.
              </Text>
            ) : null}

            <View style={styles.toggleWrap}>
              <Text style={styles.toggleText}>
                {mode === 'login' ? 'New to Swara? ' : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} activeOpacity={0.7}>
                <Text style={styles.toggleLink}>{mode === 'login' ? 'Create account' : 'Sign in'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 28 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.18)',
  },
  consent: { marginTop: 14, fontSize: 11, color: COLORS.textMuted, lineHeight: 16, textAlign: 'center' },
  link: { color: COLORS.gold, fontWeight: '700' },
  toggleWrap: { marginTop: 18, flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  toggleText: { color: COLORS.textMuted, fontSize: 13 },
  toggleLink: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
});

