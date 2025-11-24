import { signInWithRedirect, signUp } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';

const MyComponent = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const toggleCheckbox = () => {
    setChecked(!checked);
  };

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

  // validation for email
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

  // validation for password
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

  const handleSubmit = async () => {

    if (!name || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!checked) {
      alert('You must agree to the terms and policies.');
      return;
    }

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
      
      if (isSignUpComplete) {
        alert('Sign up successful!');
        router.push('/signin');
      } else {
        alert('Sign up successful! Please check your email for confirmation code.');
        router.push({ pathname: '/verify', params: { email } });
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create your account</Text>
        </View>
        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Name</Text>
          <TextInput
            style={[styles.input, name && styles.inputValid]}
            placeholder="ex: jan.smith"
            onChangeText={setName}
            value={name}
            accessibilityLabel="Name"
            accessibilityHint="Enter your full name"
          />
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
            placeholder="Create password"
            secureTextEntry={true}
            onChangeText={validatePassword}
            value={password}
            accessibilityLabel="Password"
            accessibilityHint="Enter a password with at least 8 characters, including a capital letter, number, and special character"
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>
        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Confirm Password</Text>
          <TextInput
            style={[styles.lastinput, confirmPassword && password === confirmPassword && styles.inputValid]}
            placeholder="Confirm password"
            secureTextEntry={true}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm"
          />
        </View>
        <View style={styles.checkboxContainer}>
          <Pressable
            style={styles.checkbox}
            onPress={toggleCheckbox}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
          >
            <Text style={styles.checkboxText}>{checked ? '✅' : '⬜️'}</Text>
          </Pressable>
          <Text style={styles.text}>
            I understand the{' '}
            <Text style={styles.signup}>terms and policies</Text>
          </Text>
        </View>
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.textButton}>Let's Get Started</Text>
        </Pressable>
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
        <Text style={styles.text}>
          Sign up as an{' '}
          <Text style={styles.signup} onPress={() => router.push('/orgcreate')}>
            Organization
          </Text>
        </Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: hp(3),
    alignItems: 'center',
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
  lastinput: {
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
    marginVertical: hp(1),
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
    backgroundColor: '#0085FF',
    padding: wp(1.5),
    marginVertical: hp(1),
  },
  signup: {
    color: '#0085FF',
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
    marginBottom: hp(1),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  checkbox: {
    marginRight: wp(2),
  },
  checkboxText: {
    fontSize: wp(5),
  },
});

export default MyComponent;