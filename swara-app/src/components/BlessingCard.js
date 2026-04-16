import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { FONTS } from '../utils/typography';

const BlessingCard = ({ blessing, lovedOneName, onPlay }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const fromName =
    lovedOneName ||
    blessing.lovedOne?.name ||
    blessing.lovedOneName ||
    null;

  return (
    <View style={styles.card}>
      <View style={styles.goldBorder} />
      <View style={styles.content}>
        <View style={styles.textArea}>
          <Text style={styles.title} numberOfLines={2}>
            {blessing.title || blessing.text?.substring(0, 60) + '...' || 'ఆశీర్వాదం'}
          </Text>
          {fromName ? (
            <Text style={styles.fromLine} numberOfLines={1}>
              from {fromName}
            </Text>
          ) : null}
          <Text style={styles.date}>{formatDate(blessing.createdAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => onPlay && onPlay(blessing)}
          activeOpacity={0.8}
        >
          {/* Play triangle */}
          <View style={styles.playTriangle} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goldBorder: {
    width: 4,
    backgroundColor: COLORS.gold,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    lineHeight: 22,
    marginBottom: 4,
  },
  fromLine: {
    color: COLORS.gold,
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 4,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.body,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.background,
    marginLeft: 2,
  },
});

export default BlessingCard;
