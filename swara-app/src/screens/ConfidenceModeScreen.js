import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { COLORS } from '../utils/constants';
import useStore from '../store/useStore';
import client from '../api/client';
import { uploadAudio, playAudio } from '../utils/audio';
import MicButton from '../components/MicButton';
import LovedOneAvatar from '../components/LovedOneAvatar';
import { FONTS } from '../utils/typography';

const ConfidenceModeScreen = ({ navigation }) => {
  const { lovedOne, addBlessing, setLoading, isLoading } = useStore();
  const [blessing, setBlessing] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showBlessing = (text) => {
    setBlessing(text);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleRecordingComplete = async (audioUri) => {
    if (!lovedOne?.id) {
      Alert.alert('Setup needed', 'Please set up a loved one first.');
      return;
    }

    setLoading(true);
    fadeAnim.setValue(0);

    try {
      const formData = {
        lovedOneId: lovedOne.id,
        mode: 'confidence',
      };

      const response = await uploadAudio(
        audioUri,
        '/api/conversation/send',
        formData
      );

      const responseText = response.text || response.response || '…';
      showBlessing(responseText);

      if (response.audioUrl) {
        setIsSpeaking(true);
        try {
          await playAudio(response.audioUrl);
        } finally {
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        Alert.alert(
          'Premium',
          error?.response?.data?.error ||
            'ఆశీర్వాదం mode is available on Premium only.'
        );
        return;
      }
      const msg = error?.response?.data?.message || 'Could not generate blessing. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlessing = async () => {
    if (!blessing) return;

    setSaving(true);
    try {
      const response = await client.post('/api/blessing/save', {
        text: blessing,
        lovedOneId: lovedOne?.id,
        title: blessing.substring(0, 50),
      });

      addBlessing(response.data.blessing || { text: blessing, createdAt: new Date().toISOString() });

      Alert.alert('✓ Saved', 'This ఆశీర్వాదం has been added to your collection.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Blessings'),
        },
      ]);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Could not save blessing. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const lovedOneName = lovedOne?.name || 'your loved one';

  const resetBlessing = () => {
    setBlessing(null);
    fadeAnim.setValue(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>✨ ఆశీర్వాదం Mode</Text>
          <Text style={styles.subtitle}>{`${lovedOneName}'s Blessing`}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <LovedOneAvatar
            name={lovedOneName}
            isSpeaking={isSpeaking}
            size={120}
          />
          <Text style={styles.lovedOneName}>{lovedOneName}</Text>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>
            Speak about your biggest challenge, decision, or dream.
          </Text>
        </View>

        <View style={styles.micSection}>
          {isLoading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator color={COLORS.gold} size="large" />
              <Text style={styles.loadingText}>Listening...</Text>
            </View>
          ) : (
            <MicButton
              onRecordingComplete={handleRecordingComplete}
              size={88}
            />
          )}
        </View>

        {blessing && (
          <Animated.View style={[styles.blessingContainer, { opacity: fadeAnim }]}>
            <View style={styles.blessingHeader}>
              <Text style={styles.blessingIcon}>✨</Text>
              <Text style={styles.blessingHeaderText}>ఆశీర్వాదం</Text>
            </View>

            <Text style={[styles.blessingText, styles.blessingTextItalic]}>{blessing}</Text>

            <View style={styles.blessingActions}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={resetBlessing}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineButtonText}>↻ Ask Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={handleSaveBlessing}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>💾 Save Blessing</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 60,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: COLORS.gold,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: FONTS.body,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  lovedOneName: {
    fontSize: 22,
    color: COLORS.text,
    marginTop: 14,
    fontFamily: FONTS.display,
  },
  instructionBox: {
    backgroundColor: 'rgba(61, 32, 128, 0.4)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.3)',
  },
  instructionTitle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: FONTS.body,
  },
  micSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  loadingArea: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  blessingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.gold,
    marginTop: 8,
  },
  blessingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  blessingIcon: {
    color: COLORS.gold,
    fontSize: 16,
  },
  blessingHeaderText: {
    color: COLORS.gold,
    fontSize: 14,
    letterSpacing: 1,
    fontFamily: FONTS.bodySemiBold,
  },
  blessingText: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 30,
    fontFamily: FONTS.body,
    marginBottom: 20,
  },
  blessingTextItalic: { fontStyle: 'italic' },
  blessingActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  outlineButton: {
    flex: 1,
    marginRight: 6,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    color: COLORS.gold,
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
  },
  saveButton: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
  },
});

export default ConfidenceModeScreen;
