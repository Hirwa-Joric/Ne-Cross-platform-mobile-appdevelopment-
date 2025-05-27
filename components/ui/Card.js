import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

const Card = ({ children, style, gradient = false, gradientColors }) => {
  // Use the provided gradient colors or default to the cardBackground gradient
  const colors = gradientColors || theme.GRADIENTS.lightCard;
  
  if (gradient) {
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

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