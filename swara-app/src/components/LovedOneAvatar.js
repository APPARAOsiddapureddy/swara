import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const LovedOneAvatar = ({ name = '', isSpeaking = false, size = 100 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    if (isSpeaking) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
    };
  }, [isSpeaking]);

  const outerSize = size * 1.5;
  const middleSize = size * 1.25;

  return (
    <Animated.View
      style={[
        styles.outerRing,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.middleRing,
          {
            width: middleSize,
            height: middleSize,
            borderRadius: middleSize / 2,
          },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.initial,
              { fontSize: size * 0.38 },
            ]}
          >
            {initial}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerRing: {
    backgroundColor: 'rgba(28, 15, 58, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 82, 200, 0.3)',
  },
  middleRing: {
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  innerCircle: {
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: COLORS.text,
    fontWeight: '700',
    fontFamily: 'System',
  },
});

export default LovedOneAvatar;
