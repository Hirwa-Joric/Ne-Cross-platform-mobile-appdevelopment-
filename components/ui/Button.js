import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  disabled = false, 
  loading = false,
  style,
  textStyle,
}) => {
  const isPrimary = type === 'primary';
  const isSecondary = type === 'secondary';
  const isOutline = type === 'outline';
  const isText = type === 'text';
  
  if (isPrimary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.buttonContainer, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.GRADIENTS.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            styles.primaryButton,
            disabled && styles.disabledButton,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.buttonText, styles.primaryText, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (isSecondary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          styles.secondaryButton,
          disabled && styles.disabledSecondaryButton,
          style
        ]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={theme.COLORS.primary} size="small" />
        ) : (
          <Text style={[styles.buttonText, styles.secondaryText, textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (isOutline) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          styles.outlineButton,
          disabled && styles.disabledOutlineButton,
          style
        ]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={theme.COLORS.primary} size="small" />
        ) : (
          <Text style={[styles.buttonText, styles.outlineText, textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Text button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.textButton, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.COLORS.primary} size="small" />
      ) : (
        <Text style={[styles.buttonText, styles.textButtonText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    borderRadius: theme.BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  button: {
    height: 54,
    borderRadius: theme.BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.SPACING.lg,
  },
  primaryButton: {
    backgroundColor: theme.COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.COLORS.lightGrey,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.COLORS.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    padding: theme.SPACING.sm,
  },
  buttonText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
  },
  primaryText: {
    color: theme.COLORS.text.white,
  },
  secondaryText: {
    color: theme.COLORS.text.primary,
  },
  outlineText: {
    color: theme.COLORS.primary,
  },
  textButtonText: {
    color: theme.COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledSecondaryButton: {
    borderColor: theme.COLORS.lightGrey,
    opacity: 0.6,
  },
  disabledOutlineButton: {
    borderColor: theme.COLORS.lightGrey,
    opacity: 0.6,
  },
});

export default Button; 