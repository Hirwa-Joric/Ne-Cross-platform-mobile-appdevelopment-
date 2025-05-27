import axios from 'axios';

const API_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Get all expenses
export const getAllExpenses = async () => {
  try {
    const response = await api.get('/expenses');
    return response.data;
  } catch (error) {
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
    const response = await api.post('/expenses', {
      name: expenseData.name, // Description in UI
      amount: expenseData.amount.toString(), // API expects string
      date: expenseData.date, // YYYY-MM-DD format
      description: expenseData.category, // Category is stored in description field
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing expense
export const updateExpense = async (id, expenseData) => {
  try {
    const response = await api.put(`/expenses/${id}`, {
      name: expenseData.name, // Description in UI
      amount: expenseData.amount.toString(), // API expects string
      date: expenseData.date, // YYYY-MM-DD format
      description: expenseData.category, // Category is stored in description field
    });
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