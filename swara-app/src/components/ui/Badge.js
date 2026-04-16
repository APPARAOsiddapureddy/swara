import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { FONTS } from '../../utils/typography';

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
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 0.3,
  },
});

