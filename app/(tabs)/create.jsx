import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import GradientBackground from '../../components/invertedGB';
import { hp, wp } from '../../helpers/common';
import { signUp } from '../../services/cognito';

const PLACEHOLDER_COLOR = 'rgba(255, 255, 255, 0.6)';
const PLACEHOLDER_COLOR_ACTIVE = 'rgba(255, 255, 255, 0.9)';

const SignUpScreen = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checked, setChecked] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Focus states for nicer placeholder animation
  const [focusedField, setFocusedField] = useState(null);

  const toggleCheckbox = () => setChecked(!checked);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(pwd);

  const validateEmail = (value) => {
    setEmail(value);
    if (!value) setEmailError('Email is required.');
    else if (!isValidEmail(value)) setEmailError('Please enter a valid email address.');
    else setEmailError('');
  };

  const validatePassword = (value) => {
    setPassword(value);
    if (!value) setPasswordError('Password is required.');
    else if (value.length < 8) setPasswordError('Password must be at least 8 characters long.');
    else if (!isValidPassword(value))
      setPasswordError('Password must contain at least one capital letter, one number, and one special character.');
    else setPasswordError('');
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('All fields are required.');
      return;
    }
    if (emailError || passwordError) return;
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!checked) {
      alert('You must agree to the terms & policy.');
      return;
    }

    try {
      await signUp(email, password, name);
      alert('Sign up successful! Please check your email.');
      router.push({ pathname: '/verify', params: { email } });
    } catch (error) {
      alert(error.message || 'Sign up failed');
    }
  };

  return (
    <ScreenWrapper bg="transparent">
      <View style={styles.wrapper}>
        <GradientBackground />
        <View style={styles.container}>
          <Text style={styles.title}>Create your account</Text>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, name && styles.inputValid]}
              placeholder="ex: jan.smith"
              placeholderTextColor={focusedField === 'name' || name ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : email && styles.inputValid]}
              placeholder="ex: jan.smith@email.com"
              placeholderTextColor={focusedField === 'email' || email ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR}
              value={email}
              onChangeText={validateEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordWrapper, passwordError ? styles.inputError : password && styles.inputValid]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create password"
                placeholderTextColor={focusedField === 'password' || password ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR}
                value={password}
                onChangeText={validatePassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="white"
                />
              </Pressable>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.passwordWrapper,
                confirmPassword && password === confirmPassword && styles.inputValid,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                placeholderTextColor={focusedField === 'confirm' || confirmPassword ? PLACEHOLDER_COLOR_ACTIVE : PLACEHOLDER_COLOR}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eye}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="white"
                />
              </Pressable>
            </View>
          </View>

          {/* Checkbox */}
          <View style={styles.checkboxContainer}>
            <Pressable
              style={[styles.customCheckbox, checked && styles.customCheckboxChecked]}
              onPress={toggleCheckbox}
            >
              {checked && <MaterialIcons name="check" size={18} color="white" />}
            </Pressable>
            <Text style={styles.checkboxLabel}>
              I understood the <Text style={styles.linkText}>terms & policy</Text>.
            </Text>
          </View>

          {/* Submit */}
          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Let's Get Started</Text>
          </Pressable>

          <Text style={styles.orText}>Or sign up with</Text>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn} onPress={() => signInWithRedirect({ provider: 'Google' })}>
              <Image source={require('../../assets/images/googlelogo.png')} style={styles.socialIcon} />
            </Pressable>
            <Pressable style={styles.socialBtn} onPress={() => signInWithRedirect({ provider: 'Facebook' })}>
              <Image source={require('../../assets/images/fblogo.png')} style={styles.socialIcon} />
            </Pressable>
            <Pressable style={styles.socialBtn} onPress={() => signInWithRedirect({ provider: 'Twitter' })}>
              <Image source={require('../../assets/images/twitterlogo.png')} style={styles.socialIcon} />
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.push('/signin')}>
              Login
            </Text>
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative' },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(5),
    paddingHorizontal: wp(10),
  },
  title: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: hp(4),
  },
  inputGroup: { width: '100%', marginBottom: hp(1.5) },
  label: { fontSize: wp(4), color: '#ffffffff', marginBottom: hp(0.8) },
  input: {
    height: hp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    fontSize: wp(4.2),
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  passwordWrapper: {
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
    fontSize: wp(4.2),
    color: '#fff',
  },
  eye: { padding: wp(2) },
  inputError: { borderColor: '#ff4444', borderWidth: 1.5 },
  inputValid: { borderColor: '#00C853', borderWidth: 1.5 },
  errorText: { color: '#ff4444', fontSize: wp(3.6), marginTop: hp(0.5) },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '84%',
    marginVertical: hp(1.5),
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#999',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  customCheckboxChecked: {
    backgroundColor: '#0085FF',
    borderColor: '#0085FF',
  },
  checkboxLabel: { fontSize: wp(3.8), color: '#333', flex: 1 },
  linkText: { color: '#0085FF', fontWeight: '500' },

  button: {
    width: '80%',
    height: hp(5.5),
    backgroundColor: '#0085FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(1),
  },
  buttonText: { color: 'white', fontSize: wp(4), fontWeight: '600' },
  orText: { marginVertical: hp(2), color: '#666', fontSize: wp(4) },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: wp(5), marginBottom: hp(4) },
  socialBtn: {
    width: 45,
    height: 45,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  socialIcon: { width: 25, height: 25 },
  footerText: { fontSize: wp(4.2), color: '#666' },
  loginLink: { color: '#0085FF', fontWeight: 'bold' },
});

export default SignUpScreen;