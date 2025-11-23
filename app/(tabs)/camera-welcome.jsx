import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { hp, wp } from '../../helpers/common';

// edit mu sa  API  na ginagamit mo
const BACKEND_UPLOAD_URL = 'http://192.168.68.119:8000/camera';
// if correct na  yung api eto na yan const BACKEND_UPLOAD_URL = 'http://192.168.68.68:8000/camera';

export default function CameraWelcome() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImageAndUpload = async () => {
    try {
      // 1. Ask for permission
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Needed', 'Allow access to your photos to continue.');
        return;
      }

      // 2. Let user pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        console.log('User cancelled');
        return;
      }

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = asset.fileName || uri.split('/').pop() || 'photo.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      setImage(uri);        // Show preview
      setUploading(true);   // Show loading

      // 3. Create FormData
      const formData = new FormData();
      formData.append('photo', {
        uri: uri,
        name: fileName,
        type: fileType,
      });

      // 4. Send to backend
      const response = await fetch(BACKEND_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      Alert.alert('Success!', data.message || 'Photo uploaded successfully!');

    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error.message || 'Please try again later.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            source={require('../../assets/images/avatar.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Choose an existing photo or take a new one to analyze your skin condition.
        </Text>

        {image && <Image source={{ uri: image }} style={styles.preview} />}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, uploading && styles.buttonDisabled]}
            onPress={pickImageAndUpload}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>Upload from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, uploading && styles.buttonDisabled]}
            onPress={() => router.push('/assess4')}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {uploading && (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: hp(3) }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingTop: Platform.select({ ios: hp(1.5), android: hp(4) }),
    paddingBottom: hp(2.5),
    marginTop: Platform.select({ ios: 0, android: hp(1) }),
  },
  avatarContainer: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatar: { width: '100%', height: '100%' },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: hp(3.2),
    fontWeight: '700',
    color: '#333',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: hp(2),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(4),
    lineHeight: hp(2.8),
  },
  preview: {
    width: wp(65),
    height: wp(65),
    borderRadius: 16,
    marginVertical: hp(4),
    backgroundColor: '#f0f0f0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp(4),
    marginTop: hp(4),
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(6),
    borderRadius: 15,
    minWidth: wp(38),
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '600',
  },
});