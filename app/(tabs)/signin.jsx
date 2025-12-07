import { signIn, signInWithRedirect } from '@aws-amplify/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import GradientBackground from '../../components/invertedGB';
import { hp, wp } from '../../helpers/common';

const PLACEHOLDER_COLOR = 'rgba(255, 255, 255, 0.6)';
const PLACEHOLDER_COLOR_ACTIVE = 'rgba(255, 255, 255, 0.9)';

const SignIn = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Validation helpers
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPassword = password =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

  const validateEmail = value => {
    setEmail(value);
    if (!value) {
      setEmailError('Email is required.');
    } else if (!isValidEmail(value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = value => {
    setPassword(value);
    if (!value) {
      setPasswordError('Password is required.');
    } else if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
    } else if (!isValidPassword(value)) {
      setPasswordError('Must contain 1 uppercase, 1 number & 1 special character.');
    } else {
      setPasswordError('');
    }
  };

  const handleSignIn = async () => {
    // Final check before hitting Amplify
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please fill in email and password.');
      return;
    }
    if (emailError || passwordError) {
      Alert.alert('Fix errors', 'Please correct the errors above.');
      return;
    }

    setLoading(true);
    try {
      const response = await signIn({ username: email.trim().toLowerCase(), password });

      if (response.isSignedIn) {
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error(err);
      const message =
        err.message ||
        err.name === 'UserNotConfirmedException'
          ? 'Please confirm your email first.'
          : 'Sign in failed. Check your credentials.';
      Alert.alert('Sign In Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="transparent">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.wrapper}>
        <GradientBackground />
        <ScrollView contentContainerStyle={styles.container}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sign in your account</Text>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.labelText}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : email && styles.inputValid,
              ]}
              placeholder="ex: jan.smith@email.com"
              placeholderTextColor={focusedField === 'email' || email ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR}
              value={email}
              onChangeText={validateEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.labelText}>Password</Text>
            <View
              style={[
                styles.passwordInputWrapper,
                passwordError ? styles.inputError : password && styles.inputValid,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor={focusedField === 'password' || password ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR}
                value={password}
                onChangeText={validatePassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#ccc"
                />
              </Pressable>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* SIGN IN BUTTON */}
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.textButton}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </Text>
          </Pressable>

          {/* Social Login */}
          <Text style={styles.text}>Or sign in with</Text>
          <View style={styles.iconview}>
            <Pressable
              style={styles.socialButton}
              onPress={() => signInWithRedirect({ provider: 'Google' })}
            >
              <Image
                source={require('../../assets/images/googlelogo.png')}
                style={styles.socialIcon}
              />
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() => signInWithRedirect({ provider: 'Facebook' })}
            >
              <Image
                source={require('../../assets/images/fblogo.png')}
                style={styles.socialIcon}
              />
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() => signInWithRedirect({ provider: 'Twitter' })}
            >
              <Image
                source={require('../../assets/images/twitterlogo.png')}
                style={styles.socialIcon}
              />
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signup} onPress={() => router.push('/create')}>
              SIGN UP
            </Text>
          </Text>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative' },
  container: {
    alignItems: 'center',
    paddingBottom: hp(5),
  },
  titleContainer: {
    width: wp(80),
    alignItems: 'flex-start',
    marginTop: hp(5),
    marginBottom: hp(3),
  },
  title: {
    fontSize: wp(6.5),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  inputContainer: {
    width: wp(80),
    marginBottom: hp(2),
  },
  labelText: {
    fontSize: wp(4),
    color: '#ffffff',
    marginBottom: hp(0.5),
  },
  input: {
    height: hp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    fontSize: wp(4),
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  passwordInputWrapper: {
    height: hp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  passwordInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#fff',
  },
  eyeButton: {
    padding: wp(2),
  },
  inputError: { borderColor: '#ff4444', borderWidth: 1.5 },
  inputValid: { borderColor: '#00C853', borderWidth: 1.5 },
  errorText: {
    color: '#ff4444',
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  button: {
    height: hp(6),
    width: wp(80),
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(2),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  textButton: {
    color: '#50a2ffff',
    fontSize: wp(4.5),
    fontWeight: '600',
  },
  text: {
    fontSize: wp(4),
    color: '#ffffffff',
    marginVertical: hp(2),
  },
  iconview: {
    flexDirection: 'row',
    gap: wp(6),
    marginBottom: hp(4),
  },
  socialButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  socialIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  signupText: {
    fontSize: wp(4),
    color: '#666',
  },
  signup: {
    color: '#0085FF',
    fontWeight: 'bold',
  },
});

export default SignIn;