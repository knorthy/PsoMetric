import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import styles from '../styles/verifyStyles';

import ScreenWrapper from '../components/ScreenWrapper';
import { confirmSignUp, resendSignUpCode } from '../services/cognito';

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
      const { isSignUpComplete } = await confirmSignUp(email, code.trim());

      setLoading(false);
      
      if (isSignUpComplete) {
        Alert.alert(
          'Account Verified!',
          'Your account has been verified successfully. You can now sign in.',
          [
            {
              text: 'Sign In',
              onPress: () => router.replace('/signin'),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      setLoading(false);
      console.log('Verification Error:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid or expired code. Please try again.'
      );
    }
  };

  // HANDLER: Resend verification code
  const handleResendCode = async () => {
    try {
      await resendSignUpCode(email);
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

export default VerifyScreen;