const COLORS = {
  primary: '#3B3B98', // Indigo/Deep Blue
  secondary: '#4F8A8B', // Muted Teal
  background: '#F7F9FC',
  cardBackground: '#FFFFFF',
  lightGrey: '#E5E7EB',
  mediumGrey: '#9CA3AF',
  darkGrey: '#374151',
  error: '#EF4444',
  text: {
    primary: '#374151',
    secondary: '#6B7280',
    light: '#9CA3AF',
    white: '#FFFFFF'
  },
  // Additional accent colors for gradients
  accent1: '#6C63FF', // Vibrant purple
  accent2: '#553EB5', // Deep purple
  accent3: '#4AC2C4', // Bright teal
};

const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
};

const GRADIENTS = {
  // Modern SaaS style gradients
  primaryButton: ['#3B3B98', '#323278'],
  primaryCard: ['#3B3B98', '#4B4BBE'],
  accentCard: ['#553EB5', '#6C63FF'],
  blueViolet: ['#3B3B98', '#6C63FF'],
  purpleTeal: ['#6C63FF', '#4AC2C4'],
  lightCard: ['#FFFFFF', '#F5F7FA'],
  headerGradient: ['rgba(59, 59, 152, 0.9)', 'rgba(59, 59, 152, 0.7)'],
  expensesCard: ['#3B3B98', '#553EB5'],
  cardBackground: ['#FFFFFF', '#F7F9FC'],
  addButton: ['#4B4BBE', '#3B3B98'],
  avatar: ['#6C63FF', '#553EB5'],
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 50,
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  SHADOWS,
  GRADIENTS,
  BORDER_RADIUS,
}; 