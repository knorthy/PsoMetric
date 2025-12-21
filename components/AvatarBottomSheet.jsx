import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthContext';

export default function AvatarBottomSheet({ onPick, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleViewProfile = () => {
    onClose?.();
    // keep callback for compatibility
    onPick?.('viewProfile');
    // Pass the current route so viewprofile knows where to go back to
    router.push({ pathname: '/(tabs)/viewprofile', params: { returnTo: pathname } });
  };

  const handleLogout = async () => {
    onClose?.();
    try {
      await logout();
      router.replace('/welcome');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Options</Text>

      <TouchableOpacity
        style={[styles.optionButton, styles.primary]}
        onPress={handleViewProfile}
      >
        <Text style={styles.optionText}>View Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, styles.secondary]}
        onPress={handleLogout}
      >
        <Text style={styles.optionText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, styles.cancel]}
        onPress={() => onClose?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center'
  },
  optionButton: {
    width: '70%',
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 12
  },
  primary: {
    backgroundColor: '#007AFF'
  },
  secondary: {
    backgroundColor: '#c5c5c5ff'
  },
  cancel: {
    backgroundColor: 'transparent'
  },
  optionText: {
    color: '#ffffffff',
    fontWeight: '700',
    fontSize: 16
  },
  cancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 16
  },
});