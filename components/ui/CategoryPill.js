import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

// Define category icons and colors
const CATEGORY_CONFIG = {
  Groceries: {
    name: 'shopping-cart',
    pack: 'MaterialIcons',
    color: '#4CAF50', // Green
    gradient: ['#4CAF50', '#81C784']
  },
  Transport: {
    name: 'car',
    pack: 'MaterialCommunityIcons',
    color: '#2196F3', // Blue
    gradient: ['#2196F3', '#64B5F6']
  },
  'Dining Out': {
    name: 'restaurant',
    pack: 'MaterialIcons',
    color: '#FF9800', // Orange
    gradient: ['#FF9800', '#FFB74D']
  },
  Entertainment: {
    name: 'local-movies',
    pack: 'MaterialIcons',
    color: '#9C27B0', // Purple
    gradient: ['#9C27B0', '#BA68C8']
  },
  Shopping: {
    name: 'shopping-bag',
    pack: 'MaterialIcons',
    color: '#E91E63', // Pink
    gradient: ['#E91E63', '#F48FB1']
  },
  Utilities: {
    name: 'lightbulb-outline',
    pack: 'MaterialIcons',
    color: '#FFC107', // Amber
    gradient: ['#FFC107', '#FFD54F']
  },
  Housing: {
    name: 'home',
    pack: 'MaterialIcons',
    color: '#795548', // Brown
    gradient: ['#795548', '#A1887F']
  },
  Healthcare: {
    name: 'medical-services',
    pack: 'MaterialIcons',
    color: '#F44336', // Red
    gradient: ['#F44336', '#EF9A9A']
  },
  Personal: {
    name: 'person',
    pack: 'MaterialIcons',
    color: '#673AB7', // Deep Purple
    gradient: ['#673AB7', '#9575CD']
  },
  Education: {
    name: 'school',
    pack: 'MaterialIcons',
    color: '#00BCD4', // Cyan
    gradient: ['#00BCD4', '#4DD0E1']
  },
  Travel: {
    name: 'flight',
    pack: 'MaterialIcons',
    color: '#03A9F4', // Light Blue
    gradient: ['#03A9F4', '#4FC3F7']
  },
  Gifts: {
    name: 'card-giftcard',
    pack: 'MaterialIcons',
    color: '#EC407A', // Pink
    gradient: ['#EC407A', '#F48FB1']
  },
  Electronics: {
    name: 'devices',
    pack: 'MaterialIcons',
    color: '#3F51B5', // Indigo
    gradient: ['#3F51B5', '#7986CB']
  },
  Insurance: {
    name: 'shield-outline',
    pack: 'MaterialCommunityIcons',
    color: '#8BC34A', // Light Green
    gradient: ['#8BC34A', '#AED581']
  },
  Savings: {
    name: 'savings',
    pack: 'MaterialIcons',
    color: '#009688', // Teal
    gradient: ['#009688', '#4DB6AC']
  },
  Others: {
    name: 'more-horiz',
    pack: 'MaterialIcons',
    color: '#607D8B', // Blue Grey
    gradient: ['#607D8B', '#90A4AE']
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
  
  // Use gradient for selected pills
  if (selected) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.touchable, style]}
        disabled={!onPress}
      >
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            currentSize.container,
          ]}
        >
          {showIcon && (
            <View style={styles.iconContainer}>
              <CategoryIcon 
                category={category} 
                size={currentSize.iconSize}
                color="white"
              />
            </View>
          )}
          <Text
            style={[
              styles.text,
              currentSize.text,
              styles.selectedText
            ]}
            numberOfLines={1}
          >
            {category}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        currentSize.container,
        style
      ]}
      disabled={!onPress}
    >
      {showIcon && (
        <View style={styles.iconContainer}>
          <CategoryIcon 
            category={category} 
            size={currentSize.iconSize}
            color={theme.COLORS.text.secondary}
          />
        </View>
      )}
      <Text
        style={[
          styles.text,
          currentSize.text
        ]}
        numberOfLines={1}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: theme.BORDER_RADIUS.pill,
    overflow: 'hidden',
  },
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
  selectedText: {
    color: 'white',
    fontFamily: theme.FONTS.semiBold,
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