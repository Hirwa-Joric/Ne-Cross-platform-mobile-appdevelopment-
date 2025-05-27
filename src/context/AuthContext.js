import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists
      const response = await axios.get(
        'https://67ac71475853dfff53dab929.mockapi.io/api/v1/users',
        {
          params: { username }
        }
      );

      const users = response.data;
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        // Create a user object with necessary fields but exclude sensitive data like password
        const userData = {
          id: user.id,
          username: user.username,
          email: user.email || '',
          fullName: user.fullName || username,
        };

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        
        // For secure operations, store the token in SecureStore
        await SecureStore.setItemAsync('userToken', user.id);
        
        // Update context state
        setUser(userData);
        setUserToken(user.id);
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      console.log('Login error', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username already exists
      const checkResponse = await axios.get(
        'https://67ac71475853dfff53dab929.mockapi.io/api/v1/users',
        {
          params: { username }
        }
      );

      if (checkResponse.data.length > 0) {
        Alert.alert('Error', 'Username already exists');
        setIsLoading(false);
        return;
      }

      // Create new user
      const response = await axios.post(
        'https://67ac71475853dfff53dab929.mockapi.io/api/v1/users',
        {
          username,
          email,
          password,
          fullName: username, // Use username as default fullName
        }
      );

      if (response.data) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email || '',
          fullName: response.data.fullName || username,
        };

        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        await SecureStore.setItemAsync('userToken', response.data.id);
        
        setUser(userData);
        setUserToken(response.data.id);
        
        Alert.alert('Success', 'Registration successful');
      }
    } catch (error) {
      console.log('Registration error', error);
      Alert.alert('Error', 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('userToken');
      await AsyncStorage.removeItem('@user');
      setUserToken(null);
      setUser(null);
    } catch (error) {
      console.log('Logout error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userToken = await SecureStore.getItemAsync('userToken');
      let userData = await AsyncStorage.getItem('@user');
      
      if (userToken && userData) {
        setUserToken(userToken);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('isLoggedIn error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        logout,
        isLoading,
        userToken,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 