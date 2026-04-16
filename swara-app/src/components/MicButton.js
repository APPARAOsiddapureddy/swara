import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  Text,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { startRecording, stopRecording } from '../utils/audio';
import useStore from '../store/useStore';

const MicButton = ({ onRecordingComplete, size = 80 }) => {
  const { isRecording, setRecording, isLoading } = useStore();
  const recordingRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    if (isRecording) {
      pulseLoop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.25,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.current.start();
    } else {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0.6);
    }

    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
    };
  }, [isRecording]);

  const handlePressIn = async () => {
    try {
      setRecording(true);
      const recording = await startRecording();
      recordingRef.current = recording;
    } catch (error) {
      setRecording(false);
      console.error('MicButton press error:', error);
    }
  };

  const handlePressOut = async () => {
    try {
      if (recordingRef.current) {
        const result = await stopRecording(recordingRef.current);
        recordingRef.current = null;
        setRecording(false);
        if (onRecordingComplete && result.uri) {
          onRecordingComplete(result.uri);
        }
      }
    } catch (error) {
      setRecording(false);
      console.error('MicButton release error:', error);
    }
  };

  return (
    <View style={styles.wrapper}>
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size * 1.6,
              height: size * 1.6,
              borderRadius: size * 0.8,
              transform: [{ scale: pulseAnim }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isRecording ? '#B8941F' : COLORS.gold,
          },
        ]}
      >
        {/* Mic icon drawn with Views */}
        <View style={styles.micContainer}>
          <View style={styles.micBody} />
          <View style={styles.micBase} />
          <View style={styles.micStand} />
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>
        {isRecording
          ? 'Release to send'
          : isLoading
            ? 'Sending...'
            : 'Hold to speak'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: COLORS.gold,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBody: {
    width: 14,
    height: 22,
    backgroundColor: '#1C0F3A',
    borderRadius: 7,
    marginBottom: 2,
  },
  micBase: {
    width: 22,
    height: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    borderWidth: 2.5,
    borderColor: '#1C0F3A',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  micStand: {
    width: 2.5,
    height: 6,
    backgroundColor: '#1C0F3A',
    marginTop: 2,
  },
  hint: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'System',
  },
});

export default MicButton;
