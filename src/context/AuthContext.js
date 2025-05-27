import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Error retrieving user data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // Get user with matching email
      const response = await axios.get(`${API_URL}/users?username=${email}`);
      
      if (response.data.length === 0) {
        throw new Error('User not found');
      }

      const userData = response.data[0];
      
      // Simple password check - in a real app, this should be done on server with proper encryption
      if (userData.password !== password) {
        throw new Error('Invalid password');
      }

      // Remove password from stored user data for security
      const userToStore = {
        id: userData.id,
        username: userData.username,
        createdAt: userData.createdAt
      };

      await AsyncStorage.setItem('@user', JSON.stringify(userToStore));
      setUser(userToStore);
      return userToStore;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      // Skip checking if user exists - MockAPI doesn't support query by username
      // const checkUser = await axios.get(`${API_URL}/users?username=${email}`);
      // 
      // if (checkUser.data.length > 0) {
      //   throw new Error('User already exists');
      // }

      console.log('Attempting to register user with:', { username: email, password: '***' });
      
      // Register new user with explicit headers and timeout
      const response = await axios({
        method: 'post',
        url: `${API_URL}/users`,
        data: {
          username: email,
          password: password,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('Registration response:', response.status, response.statusText);

      // Remove password from stored user data for security
      const userToStore = {
        id: response.data.id,
        username: response.data.username,
        createdAt: response.data.createdAt
      };

      await AsyncStorage.setItem('@user', JSON.stringify(userToStore));
      setUser(userToStore);
      return userToStore;
    } catch (error) {
      console.log('Registration error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}; 