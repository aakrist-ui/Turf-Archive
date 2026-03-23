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

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep('reset');
        Alert.alert(
          'Email service not configured',
          'The backend created a reset code but could not send email. The reset code has been filled in for you so you can continue in development.',
        );
        return;
      }

      setStep('reset');
      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter the reset code and your new password');
      return;
    }

    if (newPassword.trim().length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token: resetToken.trim(),
        newPassword: newPassword.trim(),
      });

      Alert.alert('Success', 'Your password has been reset successfully.', [
        {
          text: 'Go to Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
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
            <Text style={styles.title}>{step === 'request' ? 'Forgot Password?' : 'Reset Password'}</Text>
            <Text style={styles.subtitle}>
              {step === 'request'
                ? 'Enter your email and we will send you a reset link or code.'
                : 'Enter the reset code and choose your new password.'}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="#718096"
                editable={!loading && step === 'request'}
              />
            </View>

            {step === 'reset' ? (
              <>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Reset Code</Text>
                  <TextInput
                    style={styles.input}
                    value={resetToken}
                    onChangeText={setResetToken}
                    autoCapitalize="none"
                    placeholder="Paste reset code"
                    placeholderTextColor="#718096"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Enter new password"
                    placeholderTextColor="#718096"
                    editable={!loading}
                  />
                </View>
              </>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={step === 'request' ? handleForgotPassword : handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>{step === 'request' ? 'Send Reset Link' : 'Reset Password'}</Text>
            )}
          </TouchableOpacity>

          {step === 'reset' ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              disabled={loading}
              onPress={() => {
                setStep('request');
                setResetToken('');
                setNewPassword('');
              }}
            >
              <Text style={styles.secondaryButtonText}>Request Another Code</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              disabled={loading}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.link}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

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
    lineHeight: 24,
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
  button: {
    height: 56,
    backgroundColor: '#4c9aff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4c9aff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  secondaryButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4c9aff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4c9aff',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  link: {
    color: '#4c9aff',
    fontWeight: '700',
    fontSize: 15,
  },
});
