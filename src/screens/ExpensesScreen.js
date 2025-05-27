import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Card from '../../components/ui/Card';
import EmptyState from '../../assets/images/empty-state';
import theme from '../../constants/theme';
import { CategoryIcon, CATEGORY_CONFIG } from '../../components/ui/CategoryPill';
import SpendingChart from '../components/SpendingChart';
import { registerForPushNotificationsAsync } from '../utils/notificationManager';

const ExpensesScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, logout } = useContext(AuthContext);
  
  // Request notification permissions when the app loads
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // If user ID is not available yet, don't attempt to fetch expenses
      if (!user || !user.id) {
        setExpenses([]);
        setTotalAmount(0);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const response = await axios.get(
        'https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses'
      );
      
      console.log('Fetched expenses:', response.data.length);
      
      // Filter expenses for current user
      const userExpenses = response.data.filter(expense => 
        expense.userId === user.id
      );
      
      // Sort expenses by date (newest first)
      const sortedExpenses = userExpenses.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setExpenses(sortedExpenses);
      
      // Calculate total amount for the current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyExpenses = sortedExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      });
      
      const total = monthlyExpenses.reduce((sum, expense) => 
        sum + Number(expense.amount || 0), 0
      );
      
      setTotalAmount(total);
      
      // Calculate spending by category for the chart
      const categoryMap = {};
      monthlyExpenses.forEach(expense => {
        const category = expense.description || 'Others'; // Category is stored in description
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += Number(expense.amount || 0);
      });
      
      // Convert to array format for the chart component
      const spendingData = Object.keys(categoryMap).map(category => ({
        category,
        amount: categoryMap[category]
      }));
      
      // Sort by amount (highest first)
      spendingData.sort((a, b) => b.amount - a.amount);
      
      setSpendingByCategory(spendingData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch expenses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchExpenses();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  const handleBudgetsPress = () => {
    navigation.navigate('Budgets');
  };

  const handleExpensePress = (expense) => {
    navigation.navigate('ExpenseDetail', { expenseId: expense.id });
  };

  // Format date: "Apr 21, 2024"
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString('en-US');
  };

  // Format username to only show part before @
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // If user has a full name, extract just first name
    if (user.fullName) {
      const firstName = user.fullName.split(' ')[0];
      return firstName;
    }
    
    // If using email, always extract just the username part before @
    if (user.email) {
      // Make sure to split by @ and only take the first part
      const username = user.email.split('@')[0];
      
      // Capitalize the first letter for better presentation
      if (username && username.length > 0) {
        return username.charAt(0).toUpperCase() + username.slice(1);
      }
    }
    
    // If username exists and it's not the same as email (contains @), use it
    if (user.username && user.username.includes('@')) {
      const username = user.username.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    
    return 'User';
  };

  const getUserInitials = () => {
    if (!user) return '?';
    
    if (user.fullName) {
      const nameParts = user.fullName.split(' ');
      if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
      
      return (
        nameParts[0].charAt(0).toUpperCase() + 
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    } else if (user.email) {
      // If no fullName, use first letter of email
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          try {
            setShowUserMenu(false);
            await logout();
          } catch (error) {
            console.error('Error logging out:', error);
          }
        }}
      ]
    );
  };

  const renderExpenseItem = ({ item }) => {
    // Get the category from either the category field or description field
    const categoryText = item.category || item.description || "Others";
    
    // Convert to title case for consistency
    const formattedCategory = categoryText.charAt(0).toUpperCase() + 
                              categoryText.slice(1).toLowerCase();
    
    // Try to map to one of our predefined categories if possible
    const bestMatchCategory = getBestMatchCategory(formattedCategory);
    
    // Get the icon config
    const iconConfig = CATEGORY_CONFIG[bestMatchCategory] || CATEGORY_CONFIG.Others;
    
    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => handleExpensePress(item)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: iconConfig.color + '20' }]}>
          <CategoryIcon category={bestMatchCategory} size={24} color={iconConfig.color} />
        </View>
        
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseName} numberOfLines={1}>
            {item.name || "Untitled"}
          </Text>
          <Text style={styles.categoryText} numberOfLines={1}>
            {formattedCategory}
          </Text>
        </View>
        
        <View style={styles.expenseMetadata}>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          <Text style={styles.expenseAmount}>
            RWF {formatAmount(item.amount)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Helper function to map API categories to our predefined categories
  const getBestMatchCategory = (apiCategory) => {
    // Direct matches
    if (CATEGORY_CONFIG[apiCategory]) {
      return apiCategory;
    }
    
    // Common mappings
    const categoryMappings = {
      'Food': 'Groceries',
      'Grocery': 'Groceries',
      'School': 'Education',
      'Bills': 'Utilities',
      'Transportation': 'Transport',
      'Flight': 'Travel',
      'Trip': 'Travel',
      'Movie': 'Entertainment',
      'Dining': 'Dining Out',
      'Restaurant': 'Dining Out',
      'Home': 'Housing',
      'Rent': 'Housing',
      'Health': 'Healthcare',
      'Doctor': 'Healthcare',
      'Medicine': 'Healthcare',
      'Tools': 'Others',
      'Tool': 'Others',
      'Clothes': 'Shopping',
      'Clothing': 'Shopping',
      'Gift': 'Gifts',
      'Present': 'Gifts',
      'Electronic': 'Electronics',
      'Gadget': 'Electronics',
      'Device': 'Electronics',
      'Insurance': 'Insurance',
      'Policy': 'Insurance',
      'Savings': 'Savings',
      'Investment': 'Savings',
    };
    
    // Check if the category contains any of our mapped keywords
    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (apiCategory.toLowerCase().includes(keyword.toLowerCase())) {
        return category;
      }
    }
    
    return 'Others';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.COLORS.background} />
      
      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenuContainer}>
            <TouchableOpacity 
              style={styles.userMenuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.COLORS.text.primary} />
              <Text style={styles.userMenuItemText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text 
            style={styles.userName}
            numberOfLines={1}
          >
            {user ? 
              (user.username && user.username.split('@')[0]) || 
              (user.email && user.email.split('@')[0]) || 
              (user.fullName && user.fullName.split(' ')[0]) || 
              'User' + (user.id ? ' #' + user.id : '')
              : 'Guest'}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.budgetButton} onPress={handleBudgetsPress}>
            <Ionicons name="wallet-outline" size={24} color={theme.COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.userAvatar}
            onPress={() => setShowUserMenu(true)}
          >
            <Text style={styles.userInitials}>{getUserInitials()}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Card style={styles.totalExpensesCard}>
        <Text style={styles.totalExpensesTitle}>This Month's Total Expenses</Text>
        <Text style={styles.totalExpensesAmount}>RWF {formatAmount(totalAmount)}</Text>
      </Card>
      
      {/* Spending Chart */}
      {!loading && spendingByCategory.length > 0 && (
        <Card style={styles.chartCard}>
          <SpendingChart
            data={spendingByCategory}
            width={Dimensions.get('window').width - 48}
            height={320}
          />
        </Card>
      )}

      <View style={styles.expensesListHeader}>
        <Text style={styles.expensesListTitle}>Recent Expenses</Text>
        <TouchableOpacity onPress={handleAddExpense}>
          <Ionicons name="add" size={24} color={theme.COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
        </View>
      ) : (
        <>
          {expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState size={180} />
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubText}>
                Tap the + button to add your first expense
              </Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.expensesList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.COLORS.primary]}
                  tintColor={theme.COLORS.primary}
                />
              }
            />
          )}
        </>
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddExpense}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.SPACING.lg,
    paddingTop: theme.SPACING.lg,
    paddingBottom: theme.SPACING.md,
  },
  welcomeText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
  userName: {
    fontSize: theme.FONT_SIZES.xl,
    fontFamily: theme.FONTS.bold,
    color: theme.COLORS.text.primary,
    maxWidth: 200, // Limit width to prevent layout issues
    marginTop: 2, // Add a bit more space from the welcome text
    flexShrink: 1,
    numberOfLines: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetButton: {
    padding: 8,
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: theme.COLORS.primary,
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.semibold,
  },
  totalExpensesCard: {
    marginHorizontal: theme.SPACING.lg,
    marginTop: theme.SPACING.md,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.BORDER_RADIUS.lg,
  },
  totalExpensesTitle: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.SPACING.md,
  },
  totalExpensesAmount: {
    fontSize: theme.FONT_SIZES.xxxl,
    fontFamily: theme.FONTS.bold,
    color: 'white',
  },
  chartCard: {
    marginHorizontal: theme.SPACING.lg,
    marginTop: theme.SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  expensesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.SPACING.xl,
    marginBottom: theme.SPACING.md,
    paddingHorizontal: theme.SPACING.lg,
  },
  expensesListTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontFamily: theme.FONTS.semiBold,
    color: theme.COLORS.text.primary,
  },
  expensesList: {
    paddingHorizontal: theme.SPACING.lg,
    paddingBottom: 80, // Space for FAB
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.lightGrey,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.SPACING.md,
  },
  expenseDetails: {
    flex: 1,
    paddingRight: theme.SPACING.sm,
  },
  expenseName: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
  expenseMetadata: {
    alignItems: 'flex-end',
  },
  expenseDate: {
    fontSize: theme.FONT_SIZES.xs,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.light,
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.semiBold,
    color: theme.COLORS.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.SPACING.xl,
  },
  emptyText: {
    fontSize: theme.FONT_SIZES.xl,
    fontFamily: theme.FONTS.semiBold,
    color: theme.COLORS.text.primary,
    marginBottom: theme.SPACING.sm,
  },
  emptySubText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: theme.SPACING.lg,
    bottom: theme.SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.SHADOWS.large,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  userMenuContainer: {
    position: 'absolute',
    top: 90,
    right: theme.SPACING.lg,
    backgroundColor: 'white',
    borderRadius: theme.BORDER_RADIUS.md,
    width: 180,
    ...theme.SHADOWS.medium,
    overflow: 'hidden',
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.lightGrey,
  },
  userMenuItemText: {
    marginLeft: theme.SPACING.sm,
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
  },
});

export default ExpensesScreen; 