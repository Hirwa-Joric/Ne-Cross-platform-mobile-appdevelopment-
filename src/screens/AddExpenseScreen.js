import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { getUserBudgets } from '../api/budgetApi';
import { getAllExpenses } from '../api/expenseApi';
import { scheduleBudgetNotification } from '../utils/notificationManager';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CategoryPill } from '../../components/ui/CategoryPill';
import theme from '../../constants/theme';

// Available expense categories
const CATEGORIES = [
  'Groceries',
  'Transport',
  'Dining Out',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Housing',
  'Healthcare',
  'Personal',
  'Education',
  'Travel',
  'Gifts',
  'Electronics',
  'Insurance',
  'Savings',
  'Others',
];

const AddExpenseScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const isEditing = route.params?.expenseId !== undefined;
  const expenseId = route.params?.expenseId;
  
  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date());
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [isFetchingExpense, setIsFetchingExpense] = useState(isEditing);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form validation
  const [descriptionError, setDescriptionError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Fetch expense data if editing
  useEffect(() => {
    if (isEditing) {
      fetchExpense();
    }
  }, [isEditing, expenseId]);

  const fetchExpense = async () => {
    try {
      setIsFetchingExpense(true);
      console.log('Fetching expense for editing, ID:', expenseId);
      
      const response = await axios.get(
        `https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses/${expenseId}`
      );
      
      const expense = response.data;
      console.log('Fetched expense for editing:', expense);
      
      // Populate form fields with expense data
      setDescription(expense.name || '');
      setAmount(expense.amount ? expense.amount.toString() : '');
      setCategory(expense.description || 'Others');
      setDate(new Date(expense.date));
    } catch (error) {
      console.error('Error fetching expense details:', error);
      Alert.alert('Error', 'Unable to load expense details');
      navigation.goBack();
    } finally {
      setIsFetchingExpense(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setDescriptionError('');
    setAmountError('');
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else if (description.trim().length > 100) {
      setDescriptionError('Description cannot exceed 100 characters');
      isValid = false;
    }
    
    // Validate amount
    if (!amount) {
      setAmountError('Amount is required');
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError('Please enter a valid positive amount');
      isValid = false;
    }
    
    return isValid;
  };

  const handleAmountChange = (text) => {
    // Only allow numeric input with a single decimal point
    // Remove any non-numeric characters except for one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      // More than one decimal point, keep only the first one
      setAmount(`${parts[0]}.${parts[1]}`);
    } else {
      setAmount(filtered);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const expenseData = {
        name: description.trim(), // Using name field for description
        amount: amount,
        description: category, // Using description field for category
        date: format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        userId: user?.id,
      };
      
      console.log('Saving expense data:', expenseData);
      
      let response;
      
      if (isEditing) {
        // Update existing expense
        response = await axios.put(
          `https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses/${expenseId}`,
          expenseData
        );
        console.log('Updated expense:', response.data);
        
        // Successfully updated
        checkBudgetExceedingAndNotify().then(() => {
          Alert.alert(
            'Success', 
            'Expense updated successfully',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        });
      } else {
        // Create new expense
        response = await axios.post(
          'https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses',
          expenseData
        );
        console.log('Created expense:', response.data);
        
        // Successfully created
        checkBudgetExceedingAndNotify().then(() => {
          Alert.alert(
            'Success', 
            'Expense added successfully',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        });
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} expense`);
      setLoading(false);
    }
  };

  // Check budget limits and show notifications if needed
  const checkBudgetExceedingAndNotify = async () => {
    try {
      // Get current month in yyyy-MM format
      const currentDate = new Date();
      const currentMonthYear = format(currentDate, 'yyyy-MM');
      
      // Get all budgets for the current month
      const budgets = await getUserBudgets(currentMonthYear);
      
      // If no budgets, no need to check
      if (budgets.length === 0) {
        return;
      }
      
      // Get all expenses
      const expenses = await getAllExpenses();
      
      // Filter expenses for current month only
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      });
      
      // Check each budget
      for (const budget of budgets) {
        // Find expenses for this category
        const categoryExpenses = currentMonthExpenses.filter(expense => 
          expense.description === budget.category
        );
        
        // Calculate total spent for this category
        const totalSpent = categoryExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount || 0), 0
        );
        
        // Get budget amount
        const budgetAmount = parseFloat(budget.amount);
        
        // Calculate percentage spent
        const percentageSpent = (totalSpent / budgetAmount) * 100;
        
        console.log(`Category: ${budget.category}, Spent: ${totalSpent}, Budget: ${budgetAmount}, Percentage: ${percentageSpent}%`);
        
        // Check if budget exceeded
        if (percentageSpent >= 100) {
          await scheduleBudgetNotification(
            `Budget Exceeded: ${budget.category}`,
            `You've spent ${totalSpent.toLocaleString()} RWF of your ${budgetAmount.toLocaleString()} RWF budget for ${budget.category}.`
          );
          console.log(`Budget notification sent for ${budget.category}`);
        } 
        // Check if near budget limit
        else if (percentageSpent >= 80) {
          await scheduleBudgetNotification(
            `Budget Alert: ${budget.category}`,
            `You've spent ${percentageSpent.toFixed(0)}% of your ${budget.category} budget.`
          );
          console.log(`Budget warning sent for ${budget.category}`);
        }
      }
    } catch (error) {
      console.error('Error checking budget limits:', error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const onChangeDatePicker = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDisplayDate = (date) => {
    return format(date, 'MM/dd/yyyy');
  };

  if (isFetchingExpense) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={isEditing ? 'Edit Expense' : 'Add Expense'} 
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading expense details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Header 
          title={isEditing ? 'Edit Expense' : 'Add Expense'} 
          onBack={handleCancel}
          rightIcon={
            loading ? (
              <ActivityIndicator size="small" color={theme.COLORS.primary} />
            ) : null
          }
        />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Input
              label="Description"
              placeholder="E.g. Groceries"
              value={description}
              onChangeText={setDescription}
              error={descriptionError}
            />
            
            <Input
              label="Amount"
              placeholder="0"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              error={amountError}
              leftIcon={
                <Text style={styles.currencySymbol}>RWF</Text>
              }
            />
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={theme.COLORS.text.light} 
                  style={styles.dateIcon}
                />
                <Text style={styles.dateText}>
                  {formatDisplayDate(date)}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDatePicker}
              />
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((item) => (
                  <CategoryPill
                    key={item}
                    category={item}
                    selected={category === item}
                    onPress={() => setCategory(item)}
                    style={styles.categoryPill}
                  />
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title={isEditing ? 'Update Expense' : 'Save Expense'}
              onPress={handleSave}
              loading={loading}
            />
            <Button
              title="Cancel"
              type="secondary"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SPACING.lg,
  },
  loadingText: {
    marginTop: theme.SPACING.md,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text.secondary,
    fontFamily: theme.FONTS.regular,
  },
  formContainer: {
    marginBottom: theme.SPACING.xl,
  },
  formGroup: {
    marginBottom: theme.SPACING.md,
  },
  label: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
    marginBottom: theme.SPACING.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: theme.COLORS.lightGrey,
    borderRadius: theme.BORDER_RADIUS.md,
    paddingHorizontal: theme.SPACING.md,
    backgroundColor: theme.COLORS.background,
  },
  dateIcon: {
    marginRight: theme.SPACING.sm,
  },
  dateText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.SPACING.sm,
  },
  categoryPill: {
    marginRight: theme.SPACING.sm,
    marginBottom: theme.SPACING.sm,
  },
  currencySymbol: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
    paddingHorizontal: theme.SPACING.sm,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: theme.SPACING.lg,
  },
  cancelButton: {
    marginTop: theme.SPACING.md,
  },
});

export default AddExpenseScreen; 