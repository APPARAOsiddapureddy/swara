import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function ProgressBar({ step, total, style }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, step / total)) : 0;
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, marginBottom: 6 },
  track: {
    height: 3,
    backgroundColor: 'rgba(123, 82, 200, 0.22)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
});

