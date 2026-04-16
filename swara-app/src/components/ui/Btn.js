import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

export default function Btn({
  children,
  onPress,
  outline = false,
  danger = false,
  small = false,
  full = true,
  disabled = false,
  style,
  textStyle,
}) {
  const borderColor = danger ? COLORS.red : COLORS.gold;
  const color = outline ? (danger ? COLORS.red : COLORS.gold) : COLORS.background;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      style={[
        styles.base,
        full && styles.full,
        small ? styles.small : styles.big,
        { borderColor: outline ? `${borderColor}44` : 'transparent' },
        outline && styles.outline,
        disabled && { opacity: 0.55 },
        style,
      ]}
    >
      {outline ? (
        <Text style={[styles.txt, small ? styles.txtSmall : styles.txtBig, { color }, textStyle]}>{children}</Text>
      ) : (
        <LinearGradient
          colors={danger ? [COLORS.red, '#B91C1C'] : [COLORS.gold, COLORS.goldLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.grad, small ? styles.gradSmall : styles.gradBig]}
        >
          <Text style={[styles.txt, small ? styles.txtSmall : styles.txtBig, { color }, textStyle]}>{children}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  full: { alignSelf: 'stretch' },
  big: { paddingVertical: 15, paddingHorizontal: 24 },
  small: { paddingVertical: 10, paddingHorizontal: 18 },
  outline: { backgroundColor: 'transparent' },
  txt: { fontWeight: '700', letterSpacing: 0.3 },
  txtBig: { fontSize: 15 },
  txtSmall: { fontSize: 13 },
  grad: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradBig: { paddingVertical: 15, paddingHorizontal: 24 },
  gradSmall: { paddingVertical: 10, paddingHorizontal: 18 },
});

