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

// ⬇️ Adjust these paths to match your project structure
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';

const VerifyScreen = () => {
  const router = useRouter();
  
  // 1. Get the email passed from the Signup Screen
  const params = useLocalSearchParams();
  const { email } = params;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // ⬇️ HANDLER: Verify the OTP
  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      // AWS Amplify v6 Verification Logic
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });

      if (isSignUpComplete) {
        Alert.alert('Success', 'Email verified successfully!', [
          {
            text: 'Go to Sign In',
            onPress: () => router.replace('/signin'), // Using replace so they can't go back
          },
        ]);
      } else {
        // Edge case: Sometimes additional steps are needed
        console.log('Verification next step:', nextStep);
      }
    } catch (error) {
      console.log('Verification Error:', error);
      Alert.alert('Verification Failed', error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ HANDLER: Resend Code
  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: email });
      Alert.alert('Sent', `A new code has been sent to ${email}`);
    } catch (error) {
      console.log('Resend Error:', error);
      Alert.alert('Error', error.message);
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
          />
        </View>

        {/* Verify Button */}
        <Pressable 
          style={styles.button} 
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
          <Text style={styles.text}>Didn't receive code? </Text>
          <Pressable onPress={handleResendCode}>
            <Text style={styles.linkText}>Resend</Text>
          </Pressable>
        </View>

      </View>
    </ScreenWrapper>
  );
};

// ⬇️ STYLES
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
    letterSpacing: 5, // Makes the OTP code easier to read
  },
  button: {
    height: hp(6),
    width: wp(80),
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#0085FF',
    marginVertical: hp(2),
  },
  textButton: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: 'white',
    alignSelf: 'center',
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