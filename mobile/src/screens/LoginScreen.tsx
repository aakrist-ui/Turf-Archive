import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      await login(token);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.brandContainer}>
            <View style={styles.brandTextWrapper}>
              <Text style={styles.logoItalic}>Turf</Text>
              <Text style={styles.logo}>Archive</Text>
            </View>
            <Text style={styles.tagline}>Book your game, anytime</Text>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="#718096"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, passwordFocused && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                placeholder="Enter your password"
                placeholderTextColor="#718096"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotContainer}
              disabled={loading}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>
              Don't have an account?{' '}
              <TouchableOpacity
                disabled={loading}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.link}>Sign up</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  brandTextWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  logoItalic: {
    fontStyle: 'italic',
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  logo: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 4,
  },
  welcomeSection: {
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0aec0',
    fontWeight: '400',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e0',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    height: 56,
    backgroundColor: '#252b3b',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#252b3b',
  },
  inputFocused: {
    backgroundColor: '#2d3548',
    borderColor: '#4c9aff',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgot: {
    fontSize: 14,
    color: '#4c9aff',
    fontWeight: '600',
  },
  button: {
    height: 56,
    backgroundColor: '#4c9aff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4c9aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 15,
    color: '#a0aec0',
  },
  link: {
    color: '#4c9aff',
    fontWeight: '700',
    marginLeft: 4,
  },
});