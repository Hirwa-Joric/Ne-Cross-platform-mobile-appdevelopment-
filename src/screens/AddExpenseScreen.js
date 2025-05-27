import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';
import { addExpense, getExpenseById, updateExpense } from '../api/expenseApi';

const CATEGORIES = [
  'Food',
  'Transport',
  'Utilities',
  'Rent',
  'Groceries',
  'Entertainment',
  'Dining',
  'Other',
];

const AddExpenseScreen = ({ route, navigation }) => {
  const expenseId = route.params?.id;
  const isEditing = !!expenseId;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Custom numeric keypad digits
  const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  useEffect(() => {
    if (isEditing) {
      fetchExpenseDetails();
    }
  }, [expenseId]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const expense = await getExpenseById(expenseId);

      if (expense) {
        setName(expense.name || '');
        setAmount(expense.amount || '');
        setDate(new Date(expense.date || new Date()));
        setCategory(expense.description || CATEGORIES[0]);
      }
    } catch (error) {
      console.log('Error fetching expense:', error);
      Alert.alert('Error', 'Failed to fetch expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleNumericKeypad = (value) => {
    if (value === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (value === '.' && amount.includes('.')) {
      // Prevent multiple decimal points
      return;
    } else {
      setAmount((prev) => prev + value);
    }
  };

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return false;
    }
    
    // Check if amount is a valid number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return false;
    }
    
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      
      const expenseData = {
        name,
        amount,
        date: moment(date).format('YYYY-MM-DD'),
        category,
      };
      
      if (isEditing) {
        await updateExpense(expenseId, expenseData);
        Alert.alert('Success', 'Expense updated successfully');
      } else {
        await addExpense(expenseData);
        Alert.alert('Success', 'Expense added successfully');
      }
      
      navigation.goBack();
    } catch (error) {
      console.log('Error saving expense:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} expense`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Expense' : 'Add Expense'}</Text>
          <View style={styles.emptyView} />
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What did you spend on?"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                value={amount}
                editable={false} // Disable direct editing, use custom keypad
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {moment(date).format('MMMM D, YYYY')}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  {CATEGORIES.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Custom Numeric Keypad */}
          <View style={styles.keypadContainer}>
            <View style={styles.keypad}>
              {keypadButtons.map((button) => (
                <TouchableOpacity
                  key={button}
                  style={styles.keypadButton}
                  onPress={() => handleNumericKeypad(button)}
                >
                  <Text style={styles.keypadButtonText}>{button}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyView: {
    width: 24,
  },
  contentContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  amountInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  keypadContainer: {
    padding: 16,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keypadButton: {
    width: '32%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  keypadButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddExpenseScreen; 