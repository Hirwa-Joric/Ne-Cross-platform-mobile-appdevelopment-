import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../constants/theme';

// Define category icons and colors
const CATEGORY_CONFIG = {
  Groceries: {
    name: 'shopping-cart',
    pack: 'MaterialIcons',
    color: '#4CAF50' // Green
  },
  Transport: {
    name: 'car',
    pack: 'MaterialCommunityIcons',
    color: '#2196F3' // Blue
  },
  'Dining Out': {
    name: 'restaurant',
    pack: 'MaterialIcons',
    color: '#FF9800' // Orange
  },
  Entertainment: {
    name: 'local-movies',
    pack: 'MaterialIcons',
    color: '#9C27B0' // Purple
  },
  Shopping: {
    name: 'shopping-bag',
    pack: 'MaterialIcons',
    color: '#E91E63' // Pink
  },
  Utilities: {
    name: 'lightbulb-outline',
    pack: 'MaterialIcons',
    color: '#FFC107' // Amber
  },
  Housing: {
    name: 'home',
    pack: 'MaterialIcons',
    color: '#795548' // Brown
  },
  Healthcare: {
    name: 'medical-services',
    pack: 'MaterialIcons',
    color: '#F44336' // Red
  },
  Personal: {
    name: 'person',
    pack: 'MaterialIcons',
    color: '#673AB7' // Deep Purple
  },
  Education: {
    name: 'school',
    pack: 'MaterialIcons',
    color: '#00BCD4' // Cyan
  },
  Travel: {
    name: 'flight',
    pack: 'MaterialIcons',
    color: '#03A9F4' // Light Blue
  },
  Gifts: {
    name: 'card-giftcard',
    pack: 'MaterialIcons',
    color: '#EC407A' // Pink
  },
  Electronics: {
    name: 'devices',
    pack: 'MaterialIcons',
    color: '#3F51B5' // Indigo
  },
  Insurance: {
    name: 'shield-outline',
    pack: 'MaterialCommunityIcons',
    color: '#8BC34A' // Light Green
  },
  Savings: {
    name: 'savings',
    pack: 'MaterialIcons',
    color: '#009688' // Teal
  },
  Others: {
    name: 'more-horiz',
    pack: 'MaterialIcons',
    color: '#607D8B' // Blue Grey
  },
};

const CategoryIcon = ({ category, size = 18, color }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Others;
  const iconColor = color || config.color;
  
  if (config.pack === 'MaterialIcons') {
    return (
      <MaterialIcons name={config.name} size={size} color={iconColor} />
    );
  }
  
  return (
    <MaterialCommunityIcons name={config.name} size={size} color={iconColor} />
  );
};

const CategoryPill = ({ 
  category, 
  selected = false, 
  onPress, 
  size = 'medium', 
  showIcon = true,
  style
}) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Others;
  
  // Determine size styles
  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      text: styles.smallText,
      iconSize: 14
    },
    medium: {
      container: styles.mediumContainer,
      text: styles.mediumText,
      iconSize: 18
    },
    large: {
      container: styles.largeContainer,
      text: styles.largeText,
      iconSize: 22
    }
  };
  
  const currentSize = sizeStyles[size] || sizeStyles.medium;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        currentSize.container,
        selected && { backgroundColor: config.color + '20' }, // 20 is hex for 12% opacity
        selected && { borderColor: config.color },
        style
      ]}
      disabled={!onPress}
    >
      {showIcon && (
        <View style={styles.iconContainer}>
          <CategoryIcon 
            category={category} 
            size={currentSize.iconSize}
            color={selected ? config.color : theme.COLORS.text.secondary}
          />
        </View>
      )}
      <Text
        style={[
          styles.text,
          currentSize.text,
          selected && { color: config.color }
        ]}
        numberOfLines={1}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.COLORS.lightGrey,
    borderRadius: theme.BORDER_RADIUS.pill,
    backgroundColor: theme.COLORS.background,
  },
  smallContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  mediumContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  largeContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    fontFamily: theme.FONTS.medium,
  },
  smallText: {
    fontSize: theme.FONT_SIZES.xs,
  },
  mediumText: {
    fontSize: theme.FONT_SIZES.sm,
  },
  largeText: {
    fontSize: theme.FONT_SIZES.md,
  },
});

export { CategoryPill, CategoryIcon, CATEGORY_CONFIG }; 