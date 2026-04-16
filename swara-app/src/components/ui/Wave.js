import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function Wave({ size = 50, anim = false, color = COLORS.accent }) {
  const bars = useMemo(() => [0.3, 0.48, 0.65, 0.82, 1, 0.82, 0.65, 0.48, 0.3], []);
  const values = useRef(bars.map(() => new Animated.Value(0.3))).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (!anim) {
      if (loopRef.current) loopRef.current.stop();
      values.forEach((v) => v.setValue(0.3));
      return;
    }

    const animations = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.timing(v, { toValue: 1, duration: 700 + i * 70, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 700 + i * 70, useNativeDriver: true }),
        ])
      )
    );
    loopRef.current = Animated.parallel(animations);
    loopRef.current.start();
    return () => {
      if (loopRef.current) loopRef.current.stop();
    };
  }, [anim, values]);

  const barW = Math.max(2, Math.round(size * 0.065));
  const gap = Math.max(2, Math.round(size * 0.035));
  const radius = Math.max(2, Math.round(size * 0.04));

  return (
    <View style={[styles.row, { height: size }]}>
      {bars.map((h, i) => {
        const baseOpacity = 0.5 + h * 0.5;
        const isCenter = i === 4;
        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                width: barW,
                borderRadius: radius,
                opacity: baseOpacity,
                backgroundColor: isCenter ? COLORS.gold : color,
                height: size * 0.75 * h,
                transform: [{ scaleY: values[i] }],
                marginHorizontal: Math.round(gap / 2),
              },
            ]}
          />
        );
      })}
      <Text style={[styles.heart, { fontSize: size * 0.2 }]}>♥</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  bar: {},
  heart: {
    position: 'absolute',
    top: '8%',
    left: '50%',
    transform: [{ translateX: -6 }],
    color: COLORS.gold,
  },
});

