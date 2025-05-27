import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions for notifications
export const registerForPushNotificationsAsync = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('budget-alerts', {
        name: 'Budget Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9800',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If we don't have permission already, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      // Just log that notifications aren't enabled
      console.log('Notification permissions not granted');
      return null;
    }
    
    // Successfully set up notifications
    console.log('Notification permissions granted');
    return "notification-permissions-granted";
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return null;
  }
};

// Schedule a local notification
export const scheduleBudgetNotification = async (title, body) => {
  try {
    console.log(`Scheduling notification: ${title} - ${body}`);
    
    // Check if we have notification permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('No notification permissions');
      
      // Display an alert instead of a notification
      Alert.alert(title, body);
      return true;
    }
    
    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: 'high',
        color: '#FF9800',
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // null means show immediately
    });
    
    console.log('Notification scheduled');
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    
    // Show an alert as a fallback
    Alert.alert(title, body);
    return false;
  }
};

// Check if a category has exceeded its budget and send notification
export const checkBudgetLimits = async (categoryExpenses, budgets) => {
  try {
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get notification history from AsyncStorage
    const notificationHistoryString = await AsyncStorage.getItem('@notificationHistory');
    let notificationHistory = notificationHistoryString ? JSON.parse(notificationHistoryString) : {};
    
    // Initialize if first time or new month
    if (!notificationHistory[currentMonthYear]) {
      notificationHistory[currentMonthYear] = {};
    }
    
    // Calculate spending by category
    const spendingByCategory = {};
    categoryExpenses.forEach(expense => {
      const category = expense.description; // Category is stored in description
      spendingByCategory[category] = (spendingByCategory[category] || 0) + parseFloat(expense.amount);
    });
    
    // Check each budget
    for (const budget of budgets) {
      const category = budget.category;
      const budgetAmount = parseFloat(budget.amount);
      const spent = spendingByCategory[category] || 0;
      const percentage = (spent / budgetAmount) * 100;
      
      // Notification thresholds
      const checkThresholds = [
        { threshold: 80, notificationType: 'warning' },
        { threshold: 100, notificationType: 'exceeded' }
      ];
      
      for (const { threshold, notificationType } of checkThresholds) {
        // Check if we've crossed the threshold and haven't notified today
        if (percentage >= threshold) {
          const notificationKey = `${category}-${notificationType}`;
          const lastNotifiedDate = notificationHistory[currentMonthYear][notificationKey];
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!lastNotifiedDate || lastNotifiedDate !== today) {
            // Send notification
            let title, body;
            
            if (notificationType === 'warning') {
              title = `Budget Warning: ${category}`;
              body = `You've spent ${percentage.toFixed(0)}% of your ${category} budget.`;
            } else {
              title = `Budget Alert: ${category}`;
              body = `You've exceeded your ${category} budget!`;
            }
            
            const notified = await scheduleBudgetNotification(title, body);
            
            if (notified) {
              // Update notification history
              notificationHistory[currentMonthYear][notificationKey] = today;
              await AsyncStorage.setItem('@notificationHistory', JSON.stringify(notificationHistory));
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking budget limits:', error);
  }
};

export default {
  registerForPushNotificationsAsync,
  scheduleBudgetNotification,
  checkBudgetLimits
}; 