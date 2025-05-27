import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import AddEditBudgetScreen from '../screens/AddEditBudgetScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Expenses" 
        component={ExpensesScreen}
        options={{
          headerShown: false // Hide header since it's shown in the screen
        }}
      />
      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen}
        options={{
          headerShown: false // Custom header in component
        }}
      />
      <Stack.Screen 
        name="EditExpense" 
        component={AddExpenseScreen}
        options={{
          headerShown: false // Custom header in component
        }}
      />
      <Stack.Screen 
        name="ExpenseDetail" 
        component={ExpenseDetailScreen}
        options={{
          headerShown: false // Custom header in component
        }}
      />
      <Stack.Screen 
        name="Budgets" 
        component={BudgetsScreen}
        options={{
          headerShown: false // Custom header in component
        }}
      />
      <Stack.Screen 
        name="AddEditBudget" 
        component={AddEditBudgetScreen}
        options={{
          headerShown: false // Custom header in component
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator; 