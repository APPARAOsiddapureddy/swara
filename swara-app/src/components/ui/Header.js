import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { FONTS } from '../../utils/typography';

export default function Header({ back, title, right, onBack }) {
  return (
    <View style={styles.wrap}>
      {back ? (
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backSpace} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right || null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  backTxt: { color: COLORS.textMuted, fontSize: 18, fontWeight: '300' },
  backSpace: { width: 28 },
  title: { flex: 1, fontSize: 16, color: COLORS.text, fontFamily: FONTS.bodyMedium },
  right: { minWidth: 28, alignItems: 'flex-end' },
});

