import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import Loading from '../../components/Loading';
import ScreenWrapper from '../../components/ScreenWrapper';
import GradientBackground from '../../components/invertedGB';
import { hp, wp } from '../../helpers/common';
import { signIn } from '../../services/cognito';

const PLACEHOLDER_COLOR = 'rgba(255, 255, 255, 0.6)';
const PLACEHOLDER_COLOR_ACTIVE = 'rgba(255, 255, 255, 0.9)';

const SignIn = () => {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSignIn = async () => {
    // 1. Basic Validation
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Signing in:', email);
      
      // 2. Call Cognito Service
      const response = await signIn(email.trim().toLowerCase(), password);

      if (response.isSignedIn) {
        console.log('✅ Sign in successful');
        // 3. Update Global State directly (Optimized)
        setAuth(response); 
        // 4. Navigate to Home
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error('❌ Sign In Error:', err);
      
      // Handle specific error codes
      switch (err.code) {
        case 'UserNotConfirmedException':
          Alert.alert(
            'Email Not Verified',
            'Your email is not verified yet.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Verify Now',
                onPress: () => router.push({
                  pathname: '/(tabs)/verify',
                  params: { email: email.trim().toLowerCase() }
                })
              }
            ]
          );
          break;
        case 'NotAuthorizedException':
          Alert.alert('Login Failed', 'Incorrect email or password.');
          break;
        case 'UserNotFoundException':
          Alert.alert('Login Failed', 'User does not exist.');
          break;
        default:
          Alert.alert('Login Failed', err.message || 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="transparent">
      <View style={styles.wrapper}>
        <GradientBackground />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.titleContainer}>
          <Text style={styles.title}>Sign in your account</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: jan.smith@email.com"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="white"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeButton}
              hitSlop={10}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="white"
              />
            </Pressable>
          </View>
        </View>

        {/* Sign In Button */}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.textButton}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </Text>
        </Pressable>

        {/* Sign Up Link */}
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signup} onPress={() => router.push('/create')}>
            SIGN UP
          </Text>
        </Text>
      </ScrollView>
      {loading && <Loading />}
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
    color: '#000',
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
    color: '#000',
    height: '100%',
  },
  eyeButton: {
    padding: wp(2),
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
  signupText: {
    fontSize: wp(4),
    color: '#555',
    marginTop: hp(2),
  },
  signup: {
    color: '#0085FF',
    fontWeight: 'bold',
  },
});

export default SignIn;