import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Create a new budget
export const createBudget = async (budgetData) => {
  try {
    const user = await getCurrentUser();
    
    // Add user information to the budget
    const budgetWithUser = {
      ...budgetData,
      userId: user?.id, // Associate with current user ID
      username: user?.username, // Include username for easier filtering
      id: Date.now().toString(), // Generate a unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get existing budgets from AsyncStorage
    const existingBudgetsJson = await AsyncStorage.getItem('@budgets');
    const existingBudgets = existingBudgetsJson ? JSON.parse(existingBudgetsJson) : [];
    
    // Add new budget to the array
    existingBudgets.push(budgetWithUser);
    
    // Save updated budgets to AsyncStorage
    await AsyncStorage.setItem('@budgets', JSON.stringify(existingBudgets));
    
    return budgetWithUser;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

// Get all budgets for current user
export const getUserBudgets = async (monthYear = null) => {
  try {
    const user = await getCurrentUser();
    if (!user) return []; // If no user is logged in, return empty array
    
    // Get budgets from AsyncStorage
    const budgetsJson = await AsyncStorage.getItem('@budgets');
    if (!budgetsJson) return [];
    
    const allBudgets = JSON.parse(budgetsJson);
    
    // Filter budgets to only show those that match the current user's ID or username
    let filteredBudgets = allBudgets.filter(budget => {
      return budget.userId === user.id || budget.username === user.username;
    });
    
    // Further filter by monthYear if provided
    if (monthYear) {
      filteredBudgets = filteredBudgets.filter(budget => budget.monthYear === monthYear);
    }
    
    return filteredBudgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

// Update an existing budget
export const updateBudget = async (budgetId, budgetData) => {
  try {
    // Get existing budgets from AsyncStorage
    const budgetsJson = await AsyncStorage.getItem('@budgets');
    if (!budgetsJson) throw new Error('No budgets found');
    
    const budgets = JSON.parse(budgetsJson);
    
    // Find the index of the budget to update
    const budgetIndex = budgets.findIndex(budget => budget.id === budgetId);
    if (budgetIndex === -1) throw new Error('Budget not found');
    
    // Update the budget
    budgets[budgetIndex] = {
      ...budgets[budgetIndex],
      ...budgetData,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated budgets to AsyncStorage
    await AsyncStorage.setItem('@budgets', JSON.stringify(budgets));
    
    return budgets[budgetIndex];
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

// Delete a budget
export const deleteBudget = async (budgetId) => {
  try {
    // Get existing budgets from AsyncStorage
    const budgetsJson = await AsyncStorage.getItem('@budgets');
    if (!budgetsJson) throw new Error('No budgets found');
    
    const budgets = JSON.parse(budgetsJson);
    
    // Filter out the budget to delete
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    
    // Save updated budgets to AsyncStorage
    await AsyncStorage.setItem('@budgets', JSON.stringify(updatedBudgets));
    
    return { id: budgetId, deleted: true };
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Get a specific budget by ID
export const getBudgetById = async (budgetId) => {
  try {
    // Get existing budgets from AsyncStorage
    const budgetsJson = await AsyncStorage.getItem('@budgets');
    if (!budgetsJson) throw new Error('No budgets found');
    
    const budgets = JSON.parse(budgetsJson);
    
    // Find the budget with the given ID
    const budget = budgets.find(budget => budget.id === budgetId);
    if (!budget) throw new Error('Budget not found');
    
    return budget;
  } catch (error) {
    console.error('Error fetching budget by ID:', error);
    throw error;
  }
}; 