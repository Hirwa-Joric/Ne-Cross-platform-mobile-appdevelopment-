import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

const Header = ({ 
  title, 
  showBackButton = true, 
  rightIcon, 
  onRightPress, 
  style,
  onBack 
}) => {
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={theme.COLORS.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightIcon ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightPress}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.SPACING.lg,
    paddingVertical: theme.SPACING.md,
    backgroundColor: theme.COLORS.background,
    height: 60,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: theme.SPACING.xs,
  },
  rightButton: {
    padding: theme.SPACING.xs,
  },
  title: {
    fontSize: theme.FONT_SIZES.lg,
    fontFamily: theme.FONTS.semiBold,
    color: theme.COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
});

export default Header; 