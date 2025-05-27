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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getUserBudgets, deleteBudget } from '../api/budgetApi';
import { getAllExpenses } from '../api/expenseApi';
import Card from '../../components/ui/Card';
import { CategoryIcon, CATEGORY_CONFIG } from '../../components/ui/CategoryPill';
import theme from '../../constants/theme';

// Format date to YYYY-MM
const formatMonthYear = (date) => {
  return format(date, 'yyyy-MM');
};

// Format month name for display (e.g., "July 2024")
const formatMonthDisplay = (monthYearString) => {
  const [year, month] = monthYearString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMMM yyyy');
};

const BudgetsScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(formatMonthYear(new Date()));
  
  const { user } = useContext(AuthContext);

  const fetchBudgetsAndExpenses = async () => {
    try {
      setLoading(true);
      
      // Get all budgets for the current user
      const userBudgets = await getUserBudgets(selectedMonth);
      setBudgets(userBudgets);
      
      // Get all expenses for calculation
      const allExpenses = await getAllExpenses();
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch budgets and expenses when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBudgetsAndExpenses();
    }, [selectedMonth, user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBudgetsAndExpenses();
  };

  const handleAddBudget = () => {
    navigation.navigate('AddEditBudget', { monthYear: selectedMonth });
  };

  const handleEditBudget = (budget) => {
    navigation.navigate('AddEditBudget', { 
      budgetId: budget.id,
      monthYear: selectedMonth
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteBudget = (budgetId) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budgetId);
              // Refresh the list after deletion
              fetchBudgetsAndExpenses();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          }
        }
      ]
    );
  };

  const calculateSpentAmount = (category) => {
    // Get the current month and year
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
    
    // Filter expenses for the current month and category
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= startDate && 
        expenseDate <= endDate && 
        expense.description === category
      );
    });
    
    // Calculate the total spent amount
    return categoryExpenses.reduce((total, expense) => {
      return total + parseFloat(expense.amount || 0);
    }, 0);
  };

  const calculatePercentage = (spent, budget) => {
    if (budget <= 0) return 0;
    const percentage = (spent / budget) * 100;
    return Math.min(percentage, 100); // Cap at 100% for progress bar
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString('en-US');
  };

  // Go to previous month
  const previousMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 2, 1); // Month is 0-indexed in JS Date
    setSelectedMonth(formatMonthYear(date));
  };
  
  // Go to next month
  const nextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month), 1); // Month is 0-indexed in JS Date
    setSelectedMonth(formatMonthYear(date));
  };

  const renderBudgetItem = ({ item }) => {
    const spentAmount = calculateSpentAmount(item.category);
    const percentage = calculatePercentage(spentAmount, parseFloat(item.amount));
    const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Others;
    
    // Determine if budget is exceeded
    const isExceeded = spentAmount > parseFloat(item.amount);
    
    return (
      <TouchableOpacity
        style={styles.budgetItem}
        onPress={() => handleEditBudget(item)}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetCategory}>
            <View style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}>
              <CategoryIcon category={item.category} size={24} color={config.color} />
            </View>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBudget(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.COLORS.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.budgetDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Budget:</Text>
            <Text style={styles.budgetAmount}>RWF {formatAmount(item.amount)}</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Spent:</Text>
            <Text 
              style={[
                styles.spentAmount, 
                isExceeded && styles.exceededAmount
              ]}
            >
              RWF {formatAmount(spentAmount)}
            </Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Remaining:</Text>
            <Text 
              style={[
                styles.remainingAmount,
                isExceeded && styles.negativeAmount
              ]}
            >
              RWF {formatAmount(Math.max(parseFloat(item.amount) - spentAmount, 0))}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: isExceeded ? theme.COLORS.error : config.color }
              ]} 
            />
          </View>
          <Text style={styles.percentageText}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyBudgetsList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={72} color={theme.COLORS.lightGrey} />
      <Text style={styles.emptyTitle}>No Budgets Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your spending by setting up budgets for different categories
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddBudget}
      >
        <Text style={styles.emptyButtonText}>Create Budget</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.COLORS.background} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={theme.COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Budgets</Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddBudget}
        >
          <Ionicons name="add" size={24} color={theme.COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={previousMonth}
        >
          <Ionicons name="chevron-back" size={24} color={theme.COLORS.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>{formatMonthDisplay(selectedMonth)}</Text>
        
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={nextMonth}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={renderBudgetItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyBudgetsList}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: theme.FONT_SIZES.xl,
    fontFamily: theme.FONTS.bold,
    color: theme.COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.COLORS.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  budgetItem: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: theme.COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    padding: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.text.primary,
  },
  deleteButton: {
    padding: 8,
  },
  budgetDetails: {
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
  },
  budgetAmount: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.text.primary,
  },
  spentAmount: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.text.primary,
  },
  exceededAmount: {
    color: theme.COLORS.error,
  },
  remainingAmount: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.success,
  },
  negativeAmount: {
    color: theme.COLORS.error,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.COLORS.lightGrey,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    width: 40,
    fontSize: theme.FONT_SIZES.xs,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  emptyTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontFamily: theme.FONTS.bold,
    color: theme.COLORS.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: theme.COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.BORDER_RADIUS.lg,
  },
  emptyButtonText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.white,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.COLORS.lightGrey + '20',
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.lightGrey,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.text.primary,
  },
});

export default BudgetsScreen; 