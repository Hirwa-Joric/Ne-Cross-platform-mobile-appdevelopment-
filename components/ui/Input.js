import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secure = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secure);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          !editable && styles.disabledInput,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secure) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.COLORS.text.light}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
        />
        
        {secure && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={theme.COLORS.text.light} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secure && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.SPACING.md,
  },
  label: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
    marginBottom: theme.SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: theme.COLORS.lightGrey,
    borderRadius: theme.BORDER_RADIUS.md,
    backgroundColor: theme.COLORS.background,
    overflow: 'hidden',
  },
  focusedInput: {
    borderColor: theme.COLORS.primary,
    backgroundColor: theme.COLORS.cardBackground,
  },
  errorInput: {
    borderColor: theme.COLORS.error,
  },
  disabledInput: {
    backgroundColor: theme.COLORS.lightGrey,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: theme.SPACING.md,
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIconContainer: {
    paddingLeft: theme.SPACING.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: theme.SPACING.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.FONT_SIZES.xs,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.error,
    marginTop: theme.SPACING.xs,
  },
});

export default Input; 