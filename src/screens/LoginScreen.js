import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../assets/images/logo';
import theme from '../../constants/theme';

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.tabButton, active && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, active && styles.activeTabButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpEmailError, setSignUpEmailError] = useState('');
  const [signUpPasswordError, setSignUpPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { login, register, isLoading } = useContext(AuthContext);

  const validateLoginForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const validateSignUpForm = () => {
    let isValid = true;
    
    // Reset errors
    setSignUpEmailError('');
    setSignUpPasswordError('');
    setConfirmPasswordError('');
    
    // Validate email
    if (!signUpEmail.trim()) {
      setSignUpEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      setSignUpEmailError('Please enter a valid email');
      isValid = false;
    }
    
    // Validate password
    if (!signUpPassword) {
      setSignUpPasswordError('Password is required');
      isValid = false;
    } else if (signUpPassword.length < 6) {
      setSignUpPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (signUpPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (validateLoginForm()) {
      await login(email, password);
    }
  };

  const handleSignUp = async () => {
    if (validateSignUpForm()) {
      await register(signUpEmail, signUpEmail, signUpPassword); // Using email as username
    }
  };

  const renderLoginTab = () => (
    <View style={styles.tabContent}>
      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        leftIcon={<Ionicons name="mail-outline" size={20} color={theme.COLORS.text.light} />}
      />
      
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        secure
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.COLORS.text.light} />}
      />

      <Button
        title="Continue"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.submitButton}
      />

      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>
          Don't have an account?{' '}
          <Text
            style={styles.textLink}
            onPress={() => setActiveTab('signup')}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );

  const renderSignUpTab = () => (
    <View style={styles.tabContent}>
      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        value={signUpEmail}
        onChangeText={setSignUpEmail}
        error={signUpEmailError}
        leftIcon={<Ionicons name="mail-outline" size={20} color={theme.COLORS.text.light} />}
      />
      
      <Input
        label="Password"
        placeholder="Choose a password"
        value={signUpPassword}
        onChangeText={setSignUpPassword}
        error={signUpPasswordError}
        secure
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.COLORS.text.light} />}
      />
      
      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={confirmPasswordError}
        secure
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.COLORS.text.light} />}
      />

      <Button
        title="Sign Up"
        onPress={handleSignUp}
        loading={isLoading}
        style={styles.submitButton}
      />

      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text
            style={styles.textLink}
            onPress={() => setActiveTab('login')}
          >
            Login
          </Text>
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Logo size={90} />
            <Text style={styles.title}>Kigali Finance</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.tabsContainer}>
              <TabButton
                title="Login"
                active={activeTab === 'login'}
                onPress={() => setActiveTab('login')}
              />
              <TabButton
                title="Sign Up"
                active={activeTab === 'signup'}
                onPress={() => setActiveTab('signup')}
              />
            </View>

            {activeTab === 'login' ? renderLoginTab() : renderSignUpTab()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.SPACING.xl,
    marginBottom: theme.SPACING.xl,
  },
  title: {
    fontSize: theme.FONT_SIZES.xxl,
    fontFamily: theme.FONTS.bold,
    color: theme.COLORS.text.primary,
    marginTop: theme.SPACING.md,
  },
  formContainer: {
    backgroundColor: theme.COLORS.cardBackground,
    borderRadius: theme.BORDER_RADIUS.lg,
    ...theme.SHADOWS.medium,
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.lightGrey,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.SPACING.md,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.COLORS.primary,
  },
  tabButtonText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
  },
  activeTabButtonText: {
    color: theme.COLORS.primary,
  },
  tabContent: {
    padding: theme.SPACING.lg,
  },
  submitButton: {
    marginTop: theme.SPACING.md,
  },
  bottomTextContainer: {
    marginTop: theme.SPACING.xl,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
  textLink: {
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.primary,
  },
});

export default LoginScreen; 