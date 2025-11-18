import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, View } from 'react-native';

// Replace with your real backend endpoint
const BACKEND_UPLOAD_URL = 'http://192.168.68.119:8000/camera';

export default function CameraWelcome() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function pickImageAndUpload() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access photos is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.cancelled) return;

      setImage(result.uri);

      setUploading(true);
      const form = new FormData();
      form.append('photo', {
        uri: result.uri,
        name: 'upload.jpg',
        type: 'image/jpeg',
      });

      const res = await fetch(BACKEND_UPLOAD_URL, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
      }

      const json = await res.json().catch(() => null);
      Alert.alert('Upload successful', json ? JSON.stringify(json) : 'Server accepted the upload');
    } catch (e) {
      Alert.alert('Upload error', String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Choose an image to upload or capture a new one.</Text>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <View style={styles.buttons}>
        <Button title="Upload Image" onPress={pickImageAndUpload} disabled={uploading} />
        <View style={{ width: 16 }} />
        <Button title="Capture Image" onPress={() => router.push('/assess4')} />
      </View>

      {uploading && <ActivityIndicator style={{ marginTop: 12 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  preview: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
});
