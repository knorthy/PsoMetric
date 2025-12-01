import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';

const VerifyScreen = () => {
  const router = useRouter();
  
  // Get the email passed from the Signup Screen
  const params = useLocalSearchParams();
  const { email } = params;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // HANDLER: Verify the OTP and go to Home on success
  const handleVerify = async () => {
    if (!code || code.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code.trim()
      });

      if (isSignUpComplete) {
        router.replace('/(tabs)/home'); 
      }
    } catch (error) {
      console.log('Verification Error:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid or expired code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // HANDLER: Resend verification code
  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: email });
      Alert.alert('Code Sent', `A new verification code has been sent to ${email}`);
    } catch (error) {
      console.log('Resend Error:', error);
      Alert.alert('Error', error.message || 'Could not resend code');
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subText}>
            We've sent a verification code to:{'\n'}
            <Text style={styles.emailText}>{email || 'your email'}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Enter Code</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#A0A0A0"
            keyboardType="number-pad"
            onChangeText={setCode}
            value={code}
            maxLength={6}
            autoFocus
          />
        </View>

        {/* Confirm Email Button */}
        <Pressable 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.textButton}>Confirm Email</Text>
          )}
        </Pressable>

        {/* Resend Link */}
        <View style={styles.resendContainer}>
          <Text style={styles.text}>Didn't receive the code? </Text>
          <Pressable onPress={handleResendCode} disabled={loading}>
            <Text style={styles.linkText}>Resend</Text>
          </Pressable>
        </View>

      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(10),
    alignItems: 'center',
  },
  titleContainer: {
    width: wp(80),
    marginBottom: hp(3),
  },
  title: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: 'black',
    marginBottom: hp(1),
  },
  subText: {
    fontSize: wp(4),
    color: '#666',
    lineHeight: hp(3),
  },
  emailText: {
    fontWeight: 'bold',
    color: '#0085FF',
  },
  inputContainer: {
    width: wp(80),
    marginBottom: hp(3),
  },
  labelText: {
    fontSize: wp(4),
    color: 'black',
    marginBottom: hp(1),
  },
  input: {
    height: hp(6),
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: wp(4),
    fontSize: wp(5),
    letterSpacing: 5,
    textAlign: 'center',
  },
  button: {
    height: hp(6),
    width: wp(80),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0085FF',
    marginVertical: hp(2),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  textButton: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: 'white',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: hp(2),
  },
  text: {
    fontSize: wp(4),
    color: '#666',
  },
  linkText: {
    color: '#0085FF',
    fontWeight: 'bold',
    fontSize: wp(4),
  },
});

export default VerifyScreen;