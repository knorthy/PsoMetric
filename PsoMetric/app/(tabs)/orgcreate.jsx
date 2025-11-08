import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper'
import { hp, wp } from '../../helpers/common'

const MyComponent = () => {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
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

  const handleSubmit = () => {
    // Check for empty fields
    if (!orgName || !email || !password || !confirmPassword) {
      alert('All fields are required.');
      return;
    }

    // Check kung valid yung email 
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check kung valid yung password 
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

    // If all validations pass, proceed (e.g., navigate or API call)
    router.push('/home');
  };


  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.containerUp}>
          <Text style={styles.title}>Create your</Text>
          <Text style={styles.title}>Organization's account</Text>
          <Text style={styles.label}>Get your organizations on board!</Text>
        </View>
        {/* Organization Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Organization's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Amazon Web Services Spade"
            onChangeText={setOrgName}
            value={orgName}
            accessibilityLabel="Organization name"
          />
        </View>
        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: awslcspade@gmail.com"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            accessibilityLabel="Email address"
          />
        </View>
        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create password"
            secureTextEntry={true}
            onChangeText={setPassword}
            value={password}
            accessibilityLabel="Password"
          />
        </View>
        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Confirm Password</Text>
          <TextInput
            style={styles.lastinput}
            placeholder="Confirm password"
            secureTextEntry={true}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            accessibilityLabel="Confirm password"
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
        <Text style={styles.text}>
          Have an account?{' '}
          <Text style={styles.signup} onPress={() => router.push('/signin')}>
            Log In
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
  containerUp: {
    width: wp(80), // for consistent alignment
    alignItems: 'flex-start', 
    paddingLeft: wp(1), 
    marginTop: hp(2), 
    marginBottom: hp(0.1), // space ng text  at inputs
  },
  inputContainer: { // styles  nung input labels
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
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: 'black',
  },
  label: {
    fontSize: wp(4), 
    marginTop: hp(0.5),
    marginBottom: hp(3),
  },
  labelText: {
    fontSize: wp(4),
    color: 'black',
    marginBottom: hp(0.5),
  },
  text: {
    fontSize: wp(4),
    color: 'black',
    marginVertical: hp(2),
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
    padding: wp(1),
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