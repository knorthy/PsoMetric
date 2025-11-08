import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignupBottomSheet({ onPick, onClose }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose how you want to get started!</Text>

      <TouchableOpacity
        style={[styles.optionButton, styles.primary]}
        onPress={() => onPick?.('student')}
      >
        <Text style={styles.optionText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, styles.secondary]}
        onPress={() => onPick?.('organization')}
      >
        <Text style={styles.optionText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingBottom: 24, 
    paddingTop: 12, 
    alignItems: 'center' },
  sheet: { 
    height: '50%', 
    backgroundColor: '#fff' },
  handle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 2, 
    marginBottom: 12 },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 18, 
    textAlign: 'center' },
  optionButton: { 
    width: '70%', 
    paddingVertical: 13, 
    borderRadius: 19, 
    alignItems: 'center', 
    marginTop: 12 },
  primary: { 
    backgroundColor: '#61AFF2' },
  secondary: { 
    backgroundColor: '#c5c5c5ff' },
  optionText: { 
    color: '#ffffffff', 
    fontWeight: '700', 
    fontSize: 16 },
  cancel: { 
    marginTop: 14 },
  cancelText: { 
    color: '#666' },
});