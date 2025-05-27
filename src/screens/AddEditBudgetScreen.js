import React, { useState, useEffect, useContext } from 'react';
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
import { format, parse } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { createBudget, updateBudget, getBudgetById } from '../api/budgetApi';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CategoryPill, CATEGORY_CONFIG } from '../../components/ui/CategoryPill';
import theme from '../../constants/theme';

// Available expense categories from CategoryPill
const CATEGORIES = Object.keys(CATEGORY_CONFIG);

// Array of the next 12 months from current
const getMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    options.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    });
  }
  
  return options;
};

const AddEditBudgetScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const isEditing = route.params?.budgetId !== undefined;
  const budgetId = route.params?.budgetId;
  const initialMonthYear = route.params?.monthYear || format(new Date(), 'yyyy-MM');
  
  // Form state
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');
  const [monthYear, setMonthYear] = useState(initialMonthYear);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [isFetchingBudget, setIsFetchingBudget] = useState(isEditing);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  
  // Form validation
  const [amountError, setAmountError] = useState('');

  // Month options
  const monthOptions = getMonthOptions();
  
  // Fetch budget data if editing
  useEffect(() => {
    if (isEditing && budgetId) {
      fetchBudget();
    }
  }, [isEditing, budgetId]);

  const fetchBudget = async () => {
    try {
      setIsFetchingBudget(true);
      const budget = await getBudgetById(budgetId);
      
      // Populate form fields with budget data
      setCategory(budget.category || 'Others');
      setAmount(budget.amount ? budget.amount.toString() : '');
      setMonthYear(budget.monthYear || initialMonthYear);
      
      // Find and set the selected category index
      const categoryIndex = CATEGORIES.findIndex(cat => cat === budget.category);
      if (categoryIndex !== -1) {
        setSelectedCategoryIndex(categoryIndex);
      }
    } catch (error) {
      console.error('Error fetching budget details:', error);
      Alert.alert('Error', 'Unable to load budget details');
      navigation.goBack();
    } finally {
      setIsFetchingBudget(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setAmountError('');
    
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

  const handleCategorySelect = (index) => {
    setSelectedCategoryIndex(index);
    setCategory(CATEGORIES[index]);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const budgetData = {
        category: category,
        amount: amount,
        period: 'monthly', // For now, all budgets are monthly
        monthYear: monthYear,
      };
      
      if (isEditing) {
        // Update existing budget
        await updateBudget(budgetId, budgetData);
        
        // Successfully updated, now navigate back
        Alert.alert(
          'Success', 
          'Budget updated successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Create new budget
        await createBudget(budgetData);
        
        // Successfully created, now navigate back
        Alert.alert(
          'Success', 
          'Budget added successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} budget`);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (isFetchingBudget) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={isEditing ? 'Edit Budget' : 'Add Budget'} 
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading budget details...</Text>
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
          title={isEditing ? 'Edit Budget' : 'Add Budget'} 
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
            {/* Category Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {CATEGORIES.map((cat, index) => (
                  <CategoryPill
                    key={cat}
                    category={cat}
                    selected={index === selectedCategoryIndex}
                    onPress={() => handleCategorySelect(index)}
                  />
                ))}
              </ScrollView>
            </View>
            
            {/* Budget Amount */}
            <Input
              label="Budget Amount (RWF)"
              placeholder="E.g. 50000"
              value={amount}
              onChangeText={handleAmountChange}
              error={amountError}
              keyboardType="numeric"
              returnKeyType="done"
            />
            
            {/* Month Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Month</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={monthYear}
                  onValueChange={(itemValue) => setMonthYear(itemValue)}
                  style={styles.picker}
                >
                  {monthOptions.map((option) => (
                    <Picker.Item 
                      key={option.value} 
                      label={option.label} 
                      value={option.value} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Period (Non-editable) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Budget Period</Text>
              <View style={styles.periodContainer}>
                <Text style={styles.periodText}>Monthly</Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                type="secondary"
                style={styles.button}
              />
              <Button
                title={isEditing ? 'Update Budget' : 'Save Budget'}
                onPress={handleSave}
                isLoading={loading}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  formContainer: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.COLORS.lightGrey,
    borderRadius: theme.BORDER_RADIUS.md,
    backgroundColor: theme.COLORS.white,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  periodContainer: {
    borderWidth: 1,
    borderColor: theme.COLORS.lightGrey,
    borderRadius: theme.BORDER_RADIUS.md,
    backgroundColor: theme.COLORS.background,
    padding: 16,
  },
  periodText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
});

export default AddEditBudgetScreen;