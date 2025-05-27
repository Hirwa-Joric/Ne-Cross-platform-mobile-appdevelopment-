import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllExpenses } from '../api/expenseApi';
import { formatCurrency, calculateMonthlyTotal } from '../utils/formatUtils';
import { getCategoryIcon } from '../utils/categoryIcons';
import { AuthContext } from '../context/AuthContext';

// Import icon libraries
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ExpensesScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState('RWF 0');
  const { logout } = useContext(AuthContext);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getAllExpenses();
      console.log('Fetched expenses:', data.length);
      setExpenses(data);
      setMonthlyTotal(calculateMonthlyTotal(data));
    } catch (error) {
      console.log('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // Listen for navigation focus events to refresh expenses when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExpenses();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  const renderExpenseItem = ({ item }) => {
    console.log('Rendering expense item:', item.description);
    // Default icon in case the mapping fails
    let iconName = 'attach-money';
    let IconComponent = MaterialIcons;
    
    try {
      const iconInfo = getCategoryIcon(item.description);
      console.log('Icon info:', iconInfo);
      
      // Determine which Icon component to use based on the pack
      switch (iconInfo.pack) {
        case 'MaterialIcons':
          IconComponent = MaterialIcons;
          iconName = iconInfo.name;
          break;
        case 'MaterialCommunityIcons':
          IconComponent = MaterialCommunityIcons;
          iconName = iconInfo.name;
          break;
        case 'Ionicons':
          IconComponent = Ionicons;
          iconName = iconInfo.name;
          break;
        case 'FontAwesome':
          IconComponent = FontAwesome;
          iconName = iconInfo.name;
          break;
        default:
          // Default to a money icon from MaterialIcons
          IconComponent = MaterialIcons;
          iconName = 'attach-money';
      }
    } catch (error) {
      console.log('Error setting up icons:', error);
      // Fallback to default icon
      IconComponent = MaterialIcons;
      iconName = 'attach-money';
    }

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => navigation.navigate('ExpenseDetail', { id: item.id })}
      >
        <View style={styles.categoryIconContainer}>
          <IconComponent
            name={iconName}
            size={24}
            color="#1a73e8"
          />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseCategory}>{item.description}</Text>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity 
          style={styles.headerAction} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Expenses this Month</Text>
        <Text style={styles.totalAmount}>{monthlyTotal}</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1a73e8" style={styles.loader} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expenses found</Text>
              <Text style={styles.emptySubText}>Tap + to add your first expense</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddExpense}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerAction: {
    padding: 8,
  },
  totalContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loader: {
    marginTop: 50,
  },
});

export default ExpensesScreen; 