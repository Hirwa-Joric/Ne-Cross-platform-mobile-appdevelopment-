import moment from 'moment';

// Format date from YYYY-MM-DD to readable format
export const formatDate = (dateString) => {
  return moment(dateString).format('MMMM D, YYYY');
};

// Format timestamp to readable format
export const formatTimestamp = (timestamp) => {
  return moment(timestamp).format('MMMM D, YYYY, h:mm A');
};

// Format currency with RWF prefix and comma-separated thousands
export const formatCurrency = (amount) => {
  // Parse the amount to number (it might be stored as string in API)
  const numAmount = parseFloat(amount);
  
  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return 'RWF 0';
  }
  
  // Format with commas for thousands separator
  return `RWF ${numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Calculate total expenses for the current month
export const calculateMonthlyTotal = (expenses) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });
  
  const total = monthlyExpenses.reduce((acc, expense) => {
    return acc + parseFloat(expense.amount || 0);
  }, 0);
  
  return formatCurrency(total);
}; 