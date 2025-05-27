import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Get current user ID
const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('@user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.log('Error retrieving user data:', error);
    return null;
  }
};

// Get all expenses for current user
export const getAllExpenses = async () => {
  try {
    const user = await getCurrentUser();
    const response = await api.get('/expenses');
    
    if (!user) return response.data; // If no user is logged in, return all expenses (shouldn't happen)
    
    // Filter expenses to only show those that match the current user's ID or username
    // This is a client-side filter since the MockAPI might not support filtering by userId
    const filteredExpenses = response.data.filter(expense => {
      return expense.userId === user.id || 
             expense.username === user.username || 
             expense.createdBy === user.username;
    });
    
    return filteredExpenses;
  } catch (error) {
    console.log('Error fetching expenses:', error);
    throw error;
  }
};

// Get a specific expense by ID
export const getExpenseById = async (id) => {
  try {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add a new expense
export const addExpense = async (expenseData) => {
  try {
    const user = await getCurrentUser();
    
    // Add user information to the expense
    const expenseWithUser = {
      name: expenseData.name, // Description in UI
      amount: expenseData.amount.toString(), // API expects string
      date: expenseData.date, // YYYY-MM-DD format
      description: expenseData.category, // Category is stored in description field
      userId: user?.id, // Associate with current user ID
      username: user?.username, // Include username for easier filtering
      createdBy: user?.username // Additional field to identify the creator
    };
    
    const response = await api.post('/expenses', expenseWithUser);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing expense
export const updateExpense = async (id, expenseData) => {
  try {
    const user = await getCurrentUser();
    
    const expenseWithUser = {
      name: expenseData.name,
      amount: expenseData.amount.toString(),
      date: expenseData.date,
      description: expenseData.category,
      userId: user?.id, 
      username: user?.username,
      createdBy: user?.username
    };
    
    const response = await api.put(`/expenses/${id}`, expenseWithUser);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 