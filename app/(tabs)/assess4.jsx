import { Camera, CameraView } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

// Replace with your real backend endpoint
const BACKEND_UPLOAD_URL = 'https://your.backend.example.com/upload';

export default function CameraTab() {
  const [hasPermission, setHasPermission] = useState(null);
  // Avoid reading `Camera.Constants` during module evaluation in case the
  // native module isn't initialized yet. Use string literals which
  // `expo-camera` accepts ('back' | 'front') as a safe fallback.
  const [cameraType, setCameraType] = useState('back');
  const cameraRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
  return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} />
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <Button
            title="Flip"
            onPress={() => {
              setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
            }}
          />
          <View style={{ width: 16 }} />
          <Button
            title={uploading ? 'Uploading...' : 'Capture'}
            disabled={uploading}
            onPress={async () => {
              try {
                if (!cameraRef.current?.takePictureAsync) {
                  Alert.alert('Camera not ready', 'The camera is not ready yet.');
                  return;
                }
                setUploading(true);
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

                const form = new FormData();
                form.append('photo', {
                  uri: photo.uri,
                  name: 'photo.jpg',
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
            }}
          />
        </View>
        {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});