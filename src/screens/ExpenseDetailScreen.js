import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { CategoryPill } from '../../components/ui/CategoryPill';
import theme from '../../constants/theme';

const ExpenseDetailScreen = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchExpenseDetails();
    }, [expenseId])
  );

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching expense details for ID:', expenseId);
      
      const response = await axios.get(
        `https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses/${expenseId}`
      );
      
      console.log('Fetched expense details:', response.data);
      setExpense(response.data);
    } catch (error) {
      console.error('Error fetching expense details:', error);
      Alert.alert('Error', 'Failed to load expense details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditExpense', { expenseId: expense.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses/${expenseId}`
      );
      Alert.alert('Success', 'Expense deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString('en-US');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Expense Details" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading expense details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Expense Details" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={theme.COLORS.error} />
          <Text style={styles.errorText}>Expense not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = expense.description || "Others";

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Expense Details" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyLabel}>RWF</Text>
          <Text style={styles.amountValue}>{formatAmount(expense.amount)}</Text>
          <Text style={styles.dateValue}>{formatDate(expense.date)}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <CategoryPill 
              category={category} 
              size="large"
              style={styles.categoryPill}
            />
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{expense.name || "No description"}</Text>
          </View>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text style={styles.metaValue}>{formatDate(expense.createdAt || expense.date)}</Text>
            </View>
            
            {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last edited</Text>
                <Text style={styles.metaValue}>{formatDate(expense.updatedAt)}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Edit"
            type="outline"
            onPress={handleEdit}
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            type="secondary"
            onPress={handleDelete}
            loading={deleting}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SPACING.lg,
  },
  errorText: {
    marginTop: theme.SPACING.md,
    fontSize: theme.FONT_SIZES.lg,
    color: theme.COLORS.error,
    fontFamily: theme.FONTS.medium,
  },
  contentContainer: {
    padding: theme.SPACING.lg,
    flexGrow: 1,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: theme.SPACING.xl,
  },
  currencyLabel: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
    marginBottom: theme.SPACING.xs,
  },
  amountValue: {
    fontSize: theme.FONT_SIZES.xxxl,
    fontFamily: theme.FONTS.bold,
    color: theme.COLORS.text.primary,
  },
  dateValue: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
    marginTop: theme.SPACING.sm,
  },
  detailsContainer: {
    backgroundColor: theme.COLORS.cardBackground,
    borderRadius: theme.BORDER_RADIUS.lg,
    padding: theme.SPACING.lg,
    ...theme.SHADOWS.small,
    marginBottom: theme.SPACING.lg,
  },
  detailRow: {
    marginBottom: theme.SPACING.lg,
  },
  detailLabel: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
    marginBottom: theme.SPACING.xs,
  },
  detailValue: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.primary,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    marginTop: theme.SPACING.xs,
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.lightGrey,
    paddingTop: theme.SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.SPACING.sm,
  },
  metaLabel: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
  metaValue: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.SPACING.xs,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.COLORS.error,
  },
  deleteButtonText: {
    color: theme.COLORS.error,
  },
});

export default ExpenseDetailScreen; 