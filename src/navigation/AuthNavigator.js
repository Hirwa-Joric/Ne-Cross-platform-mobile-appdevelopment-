import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  // Show a loading screen while checking if user is logged in
  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is logged in, show main app screens
        <Stack.Screen name="MainApp" component={MainNavigator} />
      ) : (
        // User is not logged in, show authentication screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator; 