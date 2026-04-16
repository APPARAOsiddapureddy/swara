import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { FONTS } from '../utils/typography';

const ConversationBubble = ({ message, isUser = false }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={styles.text}>{message.text}</Text>
      </View>
      {message.timestamp ? (
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: COLORS.bubble_ai,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.bubble_user,
    borderBottomRightRadius: 4,
  },
  text: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONTS.body,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
    fontFamily: FONTS.body,
  },
  aiTimestamp: {
    marginLeft: 4,
  },
  userTimestamp: {
    marginRight: 4,
  },
});

export default ConversationBubble;
