import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getExpenseById, deleteExpense } from '../api/expenseApi';
import { formatCurrency, formatDate, formatTimestamp } from '../utils/formatUtils';

const ExpenseDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const data = await getExpenseById(id);
      setExpense(data);
    } catch (error) {
      console.log('Error fetching expense details:', error);
      Alert.alert('Error', 'Failed to fetch expense details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditExpense', { id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteExpense(id);
              Alert.alert('Success', 'Expense deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.log('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Expense not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <View style={styles.emptyView} />
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue}>{expense.name}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>{formatCurrency(expense.amount)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{expense.description}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Created At</Text>
          <Text style={styles.detailValue}>{formatTimestamp(expense.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
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
  detailsContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 'auto',
  },
  editButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  backButtonText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExpenseDetailScreen; 