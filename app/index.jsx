import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../components/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    // User is authenticated → go to home
    return <Redirect href="/(tabs)/home" />;
  } else {
    // User is not authenticated → go to welcome page
    return <Redirect href="/welcome" />;
  }
}
