import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { registerRootComponent } from 'expo';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AuthNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Register the app component as the root component
registerRootComponent(App);

export default App; 