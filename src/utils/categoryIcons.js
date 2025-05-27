// This file maps expense categories to their corresponding icons from react-native-vector-icons

// Define the category to icon mapping
export const getCategoryIcon = (category) => {
  const normalizedCategory = category ? category.toLowerCase().trim() : '';
  
  switch (normalizedCategory) {
    case 'food':
    case 'dining':
      return { name: 'restaurant', pack: 'MaterialIcons' };
      
    case 'transportation':
    case 'transport':
      return { name: 'car', pack: 'MaterialCommunityIcons' };
      
    case 'utilities':
    case 'bills':
      return { name: 'lightbulb', pack: 'MaterialCommunityIcons' };
      
    case 'rent':
    case 'housing':
    case 'home':
      return { name: 'home', pack: 'MaterialIcons' };
      
    case 'groceries':
    case 'shopping':
      return { name: 'cart', pack: 'Ionicons' };
      
    case 'entertainment':
    case 'leisure':
      return { name: 'ticket', pack: 'MaterialCommunityIcons' };
      
    default:
      return { name: 'circle', pack: 'FontAwesome' };
  }
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