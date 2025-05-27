import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const Card = ({ children, style, gradient = false }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.cardBackground,
    borderRadius: theme.BORDER_RADIUS.lg,
    padding: theme.SPACING.lg,
    ...theme.SHADOWS.medium,
  },
});

export default Card; 