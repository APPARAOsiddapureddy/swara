import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { FONTS } from '../../utils/typography';

export default function CheckRow({ checked, label, onToggle }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 8, alignItems: 'flex-start' },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(123, 82, 200, 0.44)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  boxOn: { borderColor: COLORS.gold, backgroundColor: 'rgba(212, 175, 55, 0.12)' },
  tick: { color: COLORS.gold, fontSize: 11, fontFamily: FONTS.bodyBold },
  label: { flex: 1, fontSize: 12.5, color: 'rgba(245,240,255,0.87)', lineHeight: 20, fontFamily: FONTS.body },
});

