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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Card from '../../components/ui/Card';
import EmptyState from '../../assets/images/empty-state';
import theme from '../../constants/theme';
import { CategoryIcon, CATEGORY_CONFIG } from '../../components/ui/CategoryPill';

const ExpensesScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const { user, logout } = useContext(AuthContext);

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

  const getUserInitials = () => {
    if (!user || !user.fullName) return '?';
    
    const nameParts = user.fullName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          try {
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
      
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.COLORS.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{getUserInitials()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <Card style={styles.totalExpensesCard}>
        <Text style={styles.totalExpensesTitle}>This Month's Total Expenses</Text>
        <Text style={styles.totalExpensesAmount}>RWF {formatAmount(totalAmount)}</Text>
      </Card>

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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    padding: theme.SPACING.xs,
    marginRight: theme.SPACING.sm,
  },
  profileButton: {
    padding: theme.SPACING.xs,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: 'white',
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.semiBold,
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
});

export default ExpensesScreen; 