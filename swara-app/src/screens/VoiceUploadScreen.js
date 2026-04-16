import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { COLORS } from '../utils/constants';
import client from '../api/client';
import useStore from '../store/useStore';
import { FONTS } from '../utils/typography';

const VoiceUploadScreen = ({ navigation, route }) => {
  const lovedOneId = route?.params?.lovedOneId;
  const { lovedOne, setLovedOne } = useStore();
  const [voiceFile, setVoiceFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const soundRef = useRef(null);

  const resolvedId = lovedOneId || lovedOne?.id;

  const pickVoiceFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setVoiceFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'There was a problem selecting the file. Please try again.');
    }
  };

  const previewVoice = async () => {
    if (!voiceFile?.uri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceFile.uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (error) {
      Alert.alert('Error', 'Could not play this audio file.');
    }
  };

  const handleUpload = async () => {
    if (!voiceFile) {
      Alert.alert('Required', 'Please choose an audio file to upload.');
      return;
    }
    if (!resolvedId) {
      Alert.alert('Error', 'Loved one could not be found. Go back and try again.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
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

      const response = await client.post(
        `/api/loved-one/${resolvedId}/upload-voice`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data?.lovedOne) {
        setLovedOne(response.data.lovedOne);
      }

      Alert.alert('Success', 'Voice sample uploaded.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Upload failed. Please try again later.';
      Alert.alert('Error', msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Voice sample</Text>
        <Text style={styles.subtitle}>~30–60s of clear audio — voice note or call recording.</Text>

        {/* Upload area */}
        <TouchableOpacity
          style={[styles.uploadArea, voiceFile && styles.uploadAreaFilled]}
          onPress={pickVoiceFile}
          activeOpacity={0.8}
        >
          {voiceFile ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileCheckmark}>✓</Text>
              <Text style={styles.fileName} numberOfLines={1}>
                {voiceFile.name}
              </Text>
              <Text style={styles.fileSize}>
                {voiceFile.size ? `${(voiceFile.size / 1024).toFixed(0)} KB` : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>🎙</Text>
              <Text style={styles.uploadText}>Tap to upload audio file</Text>
              <Text style={styles.uploadTextSub}>.mp3, .m4a, .wav, .mp4 — max 50MB</Text>
            </View>
          )}
        </TouchableOpacity>

        {voiceFile && (
          <TouchableOpacity
            style={styles.previewButton}
            onPress={previewVoice}
            activeOpacity={0.8}
          >
            <View style={styles.playIcon} />
            <Text style={styles.previewText}>Preview audio</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Only upload what you have permission to use.</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!voiceFile || uploading) && { opacity: 0.6 },
          ]}
          onPress={handleUpload}
          disabled={!voiceFile || uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.uploadButtonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: COLORS.gold,
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    color: COLORS.text,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 16,
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(61, 32, 128, 0.3)',
    marginBottom: 16,
  },
  uploadAreaFilled: {
    borderColor: COLORS.gold,
    borderStyle: 'solid',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  uploadText: {
    color: COLORS.gold,
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
  },
  uploadTextSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.body,
  },
  fileInfo: {
    alignItems: 'center',
    gap: 6,
  },
  fileCheckmark: {
    color: COLORS.gold,
    fontSize: 24,
    marginBottom: 4,
  },
  fileName: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bodyMedium,
    maxWidth: 280,
    textAlign: 'center',
  },
  fileSize: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.body,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.gold,
  },
  previewText: {
    color: COLORS.gold,
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
  },
  infoBox: {
    backgroundColor: 'rgba(61, 32, 128, 0.4)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    marginVertical: 20,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: FONTS.body,
  },
  uploadButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  uploadButtonText: {
    color: COLORS.background,
    fontSize: 17,
    letterSpacing: 0.5,
    fontFamily: FONTS.bodyBold,
  },
});

export default VoiceUploadScreen;
