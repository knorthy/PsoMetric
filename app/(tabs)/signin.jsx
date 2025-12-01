import { MaterialIcons } from '@expo/vector-icons'; // Import icon
import { signIn, signInWithRedirect } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';

const MyComponent = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (value) => {
    setEmail(value);
    if (!value) {
      setEmailError('Email is required.');
    } else if (!isValidEmail(value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value) => {
    setPassword(value);
    if (!value) {
      setPasswordError('Password is required.');
    } else if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
    } else if (!isValidPassword(value)) {
      setPasswordError('Password must contain at least one capital letter, one number, and one special character.');
    } else {
      setPasswordError('');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      alert('All fields are required.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      alert('Password must be at least 8 characters long with at least one capital letter, one number, and one special character.');
      return;
    }

    try {
      const { isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        router.push('/home');
      }
    } catch (error) {
      alert(error.message || 'Sign in failed');
    }
  };

  return (
    <ScreenWrapper bg="white">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Sign in your account</Text>
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Email</Text>
          <TextInput
            style={[
              styles.input,
              emailError ? styles.inputError : email && styles.inputValid,
            ]}
            placeholder="ex: jan.smith@email.com"
            onChangeText={validateEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password Field with Show/Hide Icon */}
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
              secureTextEntry={!showPassword}
              onChangeText={validatePassword}
              value={password}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={toggleShowPassword} style={styles.eyeButton}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </Pressable>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* Sign In Button */}
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.textButton}>SIGN IN</Text>
        </Pressable>

        <Text style={styles.text}>Or sign in with</Text>

        <View style={styles.iconview}>
          <Pressable
            style={styles.socialButton}
            onPress={() => signInWithRedirect({ provider: 'Google' })}
          >
            <Image source={require('../../assets/images/googlelogo.png')} style={styles.socialIcon} />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => signInWithRedirect({ provider: 'Facebook' })}
          >
            <Image source={require('../../assets/images/fblogo.png')} style={styles.socialIcon} />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => signInWithRedirect({ provider: 'Twitter' })}
          >
            <Image source={require('../../assets/images/twitterlogo.png')} style={styles.socialIcon} />
          </Pressable>
        </View>

        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signup} onPress={() => router.push('/create')}>
            SIGN UP
          </Text>
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: hp(3),
  },
  titleContainer: {
    width: wp(80),
    alignItems: 'flex-start',
    marginTop: hp(5),
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: 'black',
  },
  inputContainer: {
    width: wp(80),
    marginBottom: hp(1.5),
  },
  labelText: {
    fontSize: wp(4),
    color: 'black',
    marginBottom: hp(0.5),
  },

  // Regular Input (Email)
  input: {
    height: hp(5),
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: wp(3),
    fontSize: wp(4),
  },

  // Password Input Wrapper
  passwordInputWrapper: {
    height: hp(5),
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp(3),
    paddingRight: wp(2),
  },
  passwordInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#000',
  },
  eyeButton: {
    padding: wp(2),
  },

  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  inputValid: {
    borderColor: 'green',
    borderWidth: 1,
  },
  errorText: {
    fontSize: wp(3.5),
    color: 'red',
    marginTop: hp(0.5),
  },

  button: {
    height: hp(5),
    width: wp(80),
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#0085FF',
    marginVertical: hp(1),
  },
  textButton: {
    fontSize: wp(4.5),
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  text: {
    fontSize: wp(4),
    color: 'black',
    marginVertical: hp(1.5),
  },
  iconview: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  socialButton: {
    height: hp(4),
    width: hp(4),
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
  },
  signupText: {
    fontSize: wp(4),
    color: '#333',
    textAlign: 'center',
  },
  signup: {
    color: '#0085FF',
    fontWeight: 'bold',
  },
});

export default MyComponent;