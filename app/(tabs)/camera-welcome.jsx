// camera-welcome.jsx   ← keep the .jsx extension!
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../helpers/common';

// UPDATE THIS IP TO YOUR LAPTOP'S CURRENT IPv4
const BACKEND_UPLOAD_URL = 'http://192.168.68.119:8000/analyze/';

export default function CameraWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const questionnaireParams = useLocalSearchParams();

  const [image, setImage] = useState(null);        // ← no TypeScript
  const [uploading, setUploading] = useState(false);

  const pickImageAndUpload = async (useCamera = false) => {
    try {
      let result;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is needed.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Allow access to your photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (result.canceled) return;

      const asset = result.assets[0];
      const uri = asset.uri;

      // Android-safe filename & mime type
      let fileName = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

      setImage(uri);
      setUploading(true);

      const formData = new FormData();
      // "file" is the exact name expected by FastAPI UploadFile
      formData.append('file', {
        uri,
        name: fileName,
        type,
      });

      console.log('Uploading to:', BACKEND_UPLOAD_URL);

      const response = await fetch(BACKEND_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseText = await response.text();
      console.log('Server Response:', responseText);

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);

      // Navigate to result screen with everything
      router.push({
        pathname: '/(tabs)/result',
        params: {
          ...questionnaireParams,
          analysisResult: JSON.stringify(data),
          images: JSON.stringify([uri]), // for preview on result screen
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Analysis Failed',
        error.message?.includes('Network')
          ? 'Cannot reach server. Check Wi-Fi and IP address.'
          : error.message || 'Something went wrong.'
      );
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerBlue}>Let's get you</Text>{'\n'}
          <Text style={styles.headerBlue}>started!</Text>
        </Text>

        {/* Selected image preview */}
        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </View>
        )}

        {/* Photo Guide Card */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Photo Guide</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Take Images</Text>
            <View style={styles.imageGrid}>
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Take photos in bright natural light...
            </Text>
          </View>
        </View>

        {/* Image Requirements Card */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Image Requirements</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of images to upload</Text>
            <View style={styles.imageGrid}>
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Upload clear, well-lit images...
            </Text>
          </View>
        </View>

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing your skin...</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + hp(2) }]}>
        <TouchableOpacity
          style={[styles.bottomButton, styles.uploadButton, uploading && styles.buttonDisabled]}
          onPress={() => pickImageAndUpload(false)}
          disabled={uploading}
        >
          <Ionicons name="images-outline" size={24} color="white" />
          <Text style={styles.bottomButtonText}>Upload Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, styles.takePhotoButton, uploading && styles.buttonDisabled]}
          onPress={() => pickImageAndUpload(true)}
          disabled={uploading}
        >
          <Text style={styles.bottomButtonText}>Take Photo</Text>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={24} color="#007AFF" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* Styles stay exactly the same as before – just pure JS */
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(6), paddingBottom: hp(15) },
  headerTitle: { fontSize: hp(3.5), fontWeight: '700', marginBottom: hp(3), marginTop: hp(0.1) },
  headerBlue: { color: '#007AFF' },

  previewContainer: { alignItems: 'center', marginBottom: hp(3) },
  previewImage: { width: wp(80), height: wp(80), borderRadius: 20, borderWidth: 2, borderColor: '#007AFF' },

  guideCard: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: wp(5), marginBottom: hp(3) },
  guideTitle: { fontSize: hp(2.2), fontWeight: '700', color: '#333', marginBottom: hp(2) },
  section: { marginBottom: hp(2) },
  sectionTitle: { fontSize: hp(2), fontWeight: '600', color: '#333', marginBottom: hp(1.5) },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(3), marginBottom: hp(2) },
  imagePlaceholder: { width: (wp(78) - wp(5)) / 2, height: wp(28), backgroundColor: '#E0E0E0', borderRadius: 12 },
  note: { fontSize: hp(1.6), color: '#666', lineHeight: hp(2.2) },
  noteBold: { fontWeight: '700', color: '#333' },

  loadingOverlay: { alignItems: 'center', marginVertical: hp(4) },
  loadingText: { marginTop: hp(2), fontSize: hp(2), color: '#007AFF', fontWeight: '600' },

  bottomBar: { position: 'absolute', bottom: 0, left: wp(6), right: wp(6), flexDirection: 'row', gap: wp(4), zIndex: 1000 },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    borderRadius: 50,
    gap: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.34,
    shadowRadius: 12,
    elevation: 14,
  },
  uploadButton: { backgroundColor: '#007AFF' },
  takePhotoButton: { backgroundColor: '#005EB8' },
  buttonDisabled: { backgroundColor: '#999', opacity: 0.7 },
  bottomButtonText: { color: 'white', fontSize: hp(1.8), fontWeight: '700' },
  iconCircle: { width: 36, height: 36, backgroundColor: 'white', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});