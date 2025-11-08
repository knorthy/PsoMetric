import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper'
import { hp, wp } from '../../helpers/common'

const MyComponent = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation: 8 or more characters, 1 special char, 1 capital, 1 number
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  // Real-time validation for email
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

  // Real-time validation for password
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

  const handleSubmit = () => {
    // Check for empty fields
    if (!email || !password) {
      alert('All fields are required.');
      return;
    }

    // Check email validity
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check password validity
    if (!isValidPassword(password)) {
      alert('Password must be at least 8 characters long with at least one capital letter, one number, and one special character.');
      return;
    }

    // If all validations pass, proceed
    router.push('/home');
  };

  return (
    <ScreenWrapper bg="white">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Sign in your account</Text>
        </View>
        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : email && styles.inputValid]}
            placeholder="ex: jan.smith@email.com"
            onChangeText={validateEmail}
            value={email}
            keyboardType="email-address"
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>
        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Password</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : password && styles.inputValid]}
            placeholder="Enter password"
            secureTextEntry={true}
            onChangeText={validatePassword}
            value={password}
            accessibilityLabel="Password"
            accessibilityHint="Enter a password with at least 8 characters, including a capital letter, number, and special character"
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.textButton}>SIGN IN</Text>
        </Pressable>
        <Text style={styles.text}>Or sign in with</Text>
        <View style={styles.iconview}>
          <Pressable
            style={styles.socialButton}
            onPress={() => console.log('Google login')}
          >
            <Image
              source={require('../../assets/images/googlelogo.png')}
              style={styles.socialIcon}
            />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => console.log('Facebook login')}
          >
            <Image
              source={require('../../assets/images/fblogo.png')}
              style={styles.socialIcon}
            />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => console.log('Twitter login')}
          >
            <Image
              source={require('../../assets/images/twitterlogo.png')}
              style={styles.socialIcon}
            />
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
  inputContainer: {
    width: wp(80),
    marginBottom: hp(1.5),
  },
  input: {
    height: hp(5),
    borderColor: '#e0e0e0',
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: wp(3),
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
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: 'black',
  },
  labelText: {
    fontSize: wp(4),
    color: 'black',
    marginBottom: hp(0.5),
  },
  text: {
    fontSize: wp(4),
    color: 'black',
    marginVertical: hp(0.5),
  },
  textButton: {
    fontSize: wp(4),
    color: 'white',
    alignSelf: 'center',
  },
  button: {
    height: hp(5),
    width: wp(80),
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#00b13f',
    padding: wp(1.5),
    marginVertical: hp(0.5),
  },
  signupText: {
    fontSize: wp(4),
    color: 'black',
    marginVertical: hp(0.5),
    marginBottom: hp(2),
  },
  signup: {
    color: '#00b13f',
    fontSize: wp(4),
  },
  socialButton: {
    height: hp(5),
    width: hp(5),
    borderRadius: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(2.5),
  },
  socialIcon: {
    width: wp(6),
    height: wp(6),
  },
  iconview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
});

export default MyComponent;