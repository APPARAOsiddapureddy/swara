import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

import { setNavigationRef, setStoreRef } from './src/api/client';
import useStore from './src/store/useStore';
import { COLORS } from './src/utils/constants';
import { FONTS } from './src/utils/typography';
import Wave from './src/components/ui/Wave';
import Badge from './src/components/ui/Badge';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import LovedOneSetupScreen from './src/screens/LovedOneSetupScreen';
import VoicePreviewScreen from './src/screens/VoicePreviewScreen';
import HomeScreen from './src/screens/HomeScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import ConfidenceModeScreen from './src/screens/ConfidenceModeScreen';
import BlessingsScreen from './src/screens/BlessingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PrivacySafetyScreen from './src/screens/PrivacySafetyScreen';
import VoiceUploadScreen from './src/screens/VoiceUploadScreen';
import PrivacyDetailScreen from './src/screens/PrivacyDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SwaraTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.gold,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.text,
    border: 'rgba(123, 82, 200, 0.3)',
    notification: COLORS.gold,
  },
};

const TabIcon = ({ name, focused }) => {
  const icons = {
    Home: '⌂',
    Blessings: '✦',
    Privacy: '◈',
    Profile: '○',
  };
  return (
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.55 }]}>
      {icons[name] || '·'}
    </Text>
  );
};

const TabLabel = ({ name, focused }) => (
  <Text style={[styles.tabLabel, { color: focused ? COLORS.gold : COLORS.textMuted }]}>
    {name === 'Home'
      ? 'Home'
      : name === 'Blessings'
        ? 'ఆశీర్వాదం'
        : name === 'Privacy'
          ? 'Privacy'
          : 'Profile'}
  </Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: true,
      tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      tabBarLabel: ({ focused }) => <TabLabel name={route.name} focused={focused} />,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Blessings" component={BlessingsScreen} />
    <Tab.Screen name="Privacy" component={PrivacySafetyScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
    <View style={styles.splashGlowA} />
    <View style={styles.splashGlowB} />
    <View style={styles.splashMain}>
      <Wave size={85} anim />
      <Text style={styles.splashLogo}>SWARA</Text>
      <Text style={styles.splashTelugu}>స్వర</Text>
      <Text style={styles.splashTagline}>The Voice That Never Left</Text>
    </View>
    <View style={styles.splashFooter}>
      <Badge text="DPDPA Compliant" color={COLORS.green} />
      <Text style={styles.splashFooterText}>Your data is sacred</Text>
    </View>
  </View>
);

export default function App() {
  const navigationRef = useRef(null);
  const store = useStore;
  const { loadPersistedState } = useStore();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_700Bold,
  });

  useEffect(() => {
    setStoreRef(store);
  }, []);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [navigationRef.current]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { token } = await loadPersistedState();
        setInitialRoute(token ? 'Main' : 'Onboarding');
      } catch (error) {
        setInitialRoute('Onboarding');
      } finally {
        setIsReady(true);
      }
    };
    bootstrap();
  }, []);

  if (!isReady || !fontsLoaded) return <SplashScreen />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          theme={SwaraTheme}
          onReady={() => {
            if (navigationRef.current) setNavigationRef(navigationRef.current);
          }}
        >
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              // fade_from_bottom is not supported on web
              animation: Platform.OS === 'web' ? 'fade' : 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="LovedOneSetup" component={LovedOneSetupScreen} />
            <Stack.Screen name="VoicePreview" component={VoicePreviewScreen} />
            <Stack.Screen name="VoiceUpload" component={VoiceUploadScreen} />
            <Stack.Screen name="ConfidenceMode" component={ConfidenceModeScreen} />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="PrivacyDetail" component={PrivacyDetailScreen} />
            <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // On web, flex:1 alone doesn't fill the viewport — need explicit height
    ...Platform.select({
      web: { height: '100vh', overflow: 'hidden' },
      default: {},
    }),
    backgroundColor: COLORS.background,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
    ...Platform.select({
      web: { height: '100vh' },
      default: {},
    }),
  },
  splashGlowA: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(61, 32, 128, 0.55)',
  },
  splashGlowB: {
    position: 'absolute',
    top: -60,
    right: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(123, 82, 200, 0.22)',
  },
  splashMain: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  splashLogo: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 14,
    marginTop: 18,
    fontFamily: FONTS.display,
  },
  splashTelugu: {
    fontSize: 22,
    color: COLORS.accent,
    marginTop: 6,
    fontStyle: 'italic',
    opacity: 0.9,
    fontFamily: FONTS.displayItalic,
  },
  splashTagline: {
    marginTop: 14,
    fontSize: 16,
    color: COLORS.gold,
    fontStyle: 'italic',
    opacity: 0.95,
    fontFamily: FONTS.displayItalic,
  },
  splashFooter: { alignItems: 'center', gap: 10, paddingBottom: 16 },
  splashFooterText: { color: COLORS.textMuted, fontSize: 12, opacity: 0.85 },
  tabBar: {
    backgroundColor: COLORS.darkCard,
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 82, 200, 0.35)',
    paddingTop: 6,
    paddingBottom: 8,
    height: 64,
  },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 11, marginTop: 1, fontFamily: FONTS.bodyMedium },
});
