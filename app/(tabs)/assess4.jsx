import { Camera, CameraView } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';


const BACKEND_UPLOAD_URL = 'http://192.168.68.119:8000/camera';

export default function CameraTab() {
  const [hasPermission, setHasPermission] = useState(null);
  // Avoid reading `Camera.Constants` during module evaluation in case the
  // native module isn't initialized yet. Use string literals which
  // `expo-camera` accepts ('back' | 'front') as a safe fallback.
  const [cameraType, setCameraType] = useState('back');
  const cameraRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);

  async function uriToBlob(uri) {
    // Fetch the file from the given URI and return a Blob. This helps with iOS `ph://` URIs
    // and makes uploading more reliable across platforms.
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Failed to fetch file uri: ${response.status}`);
    const blob = await response.blob();
    return blob;
  }

  async function uploadUri(uri) {
    const blob = await uriToBlob(uri);
    const form = new FormData();
    // Append blob with a filename so backend recognizes it as a file
    form.append('photo', blob, 'photo.jpg');

    const res = await fetch(BACKEND_UPLOAD_URL, {
      method: 'POST',
      body: form,
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Upload failed: ${res.status} ${text}`);
    return text;
  }

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
                setServerResponse(null);
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

                const resultText = await uploadUri(photo.uri);
                setServerResponse(resultText);
                Alert.alert('Upload successful', resultText || 'Server accepted the upload');
              } catch (e) {
                console.error('Upload error', e);
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