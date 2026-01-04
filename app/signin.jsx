import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../components/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import GradientBackground from '../components/invertedGB';
import { signIn } from '../services/cognito';
import styles from '../styles/signinStyles';

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
    
    // Small delay to ensure loading UI renders before API call
    await new Promise(resolve => setTimeout(resolve, 50));
    
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
                  pathname: '/verify',
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#50a2ffff" />
              <Text style={[styles.textButton, { marginLeft: 8 }]}>SIGNING IN...</Text>
            </View>
          ) : (
            <Text style={styles.textButton}>SIGN IN</Text>
          )}
        </Pressable>

        {/* Sign Up Link */}
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signup} onPress={() => router.push('/create')}>
            SIGN UP
          </Text>
        </Text>
      </ScrollView>
      </View>
      
      {/* Full screen loading overlay during sign-in */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default SignIn;