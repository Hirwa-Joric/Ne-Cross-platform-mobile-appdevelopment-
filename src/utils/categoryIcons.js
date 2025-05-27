// This file maps expense categories to their corresponding icons from react-native-vector-icons

// Define the category to icon mapping
export const getCategoryIcon = (category) => {
  if (!category) return { name: 'attach-money', pack: 'MaterialIcons' };
  
  const normalizedCategory = category.toLowerCase().trim();
  
  // Food related expenses
  if (normalizedCategory.includes('food') || 
      normalizedCategory.includes('dine') || 
      normalizedCategory.includes('dining') ||
      normalizedCategory.includes('restaurant') ||
      normalizedCategory.includes('lunch') ||
      normalizedCategory.includes('dinner') ||
      normalizedCategory.includes('breakfast') ||
      normalizedCategory.includes('meal') ||
      normalizedCategory.includes('tomatoes') ||
      normalizedCategory.includes('chicken') ||
      normalizedCategory.includes('potatoes') ||
      normalizedCategory.includes('rice')) {
    return { name: 'restaurant', pack: 'MaterialIcons' };
  }
  
  // Transportation related expenses
  if (normalizedCategory.includes('transport') ||
      normalizedCategory.includes('car') ||
      normalizedCategory.includes('bus') ||
      normalizedCategory.includes('taxi') ||
      normalizedCategory.includes('travel') ||
      normalizedCategory.includes('uber')) {
    return { name: 'car', pack: 'MaterialCommunityIcons' };
  }
  
  // Utilities and bills
  if (normalizedCategory.includes('util') ||
      normalizedCategory.includes('bill') ||
      normalizedCategory.includes('electric') ||
      normalizedCategory.includes('water') ||
      normalizedCategory.includes('gas') ||
      normalizedCategory.includes('phone') ||
      normalizedCategory.includes('internet')) {
    return { name: 'lightbulb', pack: 'MaterialCommunityIcons' };
  }
  
  // Housing and rent
  if (normalizedCategory.includes('rent') ||
      normalizedCategory.includes('house') ||
      normalizedCategory.includes('home') ||
      normalizedCategory.includes('building') ||
      normalizedCategory.includes('apartment')) {
    return { name: 'home', pack: 'MaterialIcons' };
  }
  
  // Groceries and shopping
  if (normalizedCategory.includes('grocer') ||
      normalizedCategory.includes('shopping') ||
      normalizedCategory.includes('shop') ||
      normalizedCategory.includes('market') ||
      normalizedCategory.includes('buy')) {
    return { name: 'cart', pack: 'Ionicons' };
  }
  
  // Entertainment and leisure
  if (normalizedCategory.includes('entertain') ||
      normalizedCategory.includes('leisure') ||
      normalizedCategory.includes('movie') ||
      normalizedCategory.includes('concert') ||
      normalizedCategory.includes('ticket') ||
      normalizedCategory.includes('game') ||
      normalizedCategory.includes('fun') ||
      normalizedCategory.includes('play')) {
    return { name: 'ticket', pack: 'MaterialCommunityIcons' };
  }
  
  // Education
  if (normalizedCategory.includes('school') ||
      normalizedCategory.includes('education') ||
      normalizedCategory.includes('academ') ||
      normalizedCategory.includes('class') ||
      normalizedCategory.includes('course') ||
      normalizedCategory.includes('tuition') ||
      normalizedCategory.includes('fees') ||
      normalizedCategory.includes('cahier')) {
    return { name: 'school', pack: 'MaterialIcons' };
  }

  // Health and medical
  if (normalizedCategory.includes('health') ||
      normalizedCategory.includes('medical') ||
      normalizedCategory.includes('doctor') ||
      normalizedCategory.includes('hospital') ||
      normalizedCategory.includes('medicine') ||
      normalizedCategory.includes('pill') ||
      normalizedCategory.includes('sick')) {
    return { name: 'medical-services', pack: 'MaterialIcons' };
  }
  
  // Default money icon is better than a circle
  return { name: 'attach-money', pack: 'MaterialIcons' };
};

// Function to get the icon component
export const renderCategoryIcon = (category, size = 24, color = '#000') => {
  const iconInfo = getCategoryIcon(category);
  
  // You would normally import these from react-native-vector-icons and use them directly
  // This is just an abstraction to make it easier to use in components
  return { 
    iconName: iconInfo.name,
    iconPack: iconInfo.pack,
    size,
    color
  };
}; 