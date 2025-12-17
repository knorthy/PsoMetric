import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AvatarBottomSheet({ onPick, onClose }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Photo</Text>

      <TouchableOpacity
        style={[styles.optionButton, styles.primary]}
        onPress={() => onPick?.('viewProfile')}
      >
        <Text style={styles.optionText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, styles.secondary]}
        onPress={() => onPick?.('changeAvatar')}
      >
        <Text style={styles.optionText}>Choose from Library</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, styles.cancel]}
        onPress={() => onClose?.()}
      >

      </TouchableOpacity>
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