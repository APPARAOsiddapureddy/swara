import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function Badge({ text, color = COLORS.green, style, textStyle }) {
  return (
    <View style={[styles.wrap, { backgroundColor: `${color}18` }, style]}>
      <Text style={[styles.txt, { color }, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  txt: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

