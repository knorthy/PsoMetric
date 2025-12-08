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
import { useAssessment } from '../../components/AssessmentContext';
import { getAuthHeaders, getCognitoAuth } from '../../helpers/auth';
import { hp, wp } from '../../helpers/common';

// ⚠️ IMPORTANT: Ensure this IP matches your laptop's IP (ipconfig)
const BACKEND_UPLOAD_URL = 'http://192.168.31.117:8000/analyze/';
const QUESTIONNAIRE_SUBMIT_URL = 'http://192.168.31.117:8000/questionnaire/submit';

export default function CameraWelcome() {
  const { getFullQuestionnaire, resetAssessment } = useAssessment();
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImageAndUpload = async (useCamera = false) => {
    try {
      // Get auth token before proceeding
      const authHeaders = await getAuthHeaders();
      const cognitoAuth = await getCognitoAuth();
      
      if (!cognitoAuth) {
        Alert.alert(
          'Authentication Required',
          'Please sign in to submit assessments.',
          [{ text: 'OK', onPress: () => router.push('/signin') }]
        );
        return;
      }

      console.log('🔐 Authenticated as:', cognitoAuth.username);

      // 1. Permission & Launch
      let result;
      if (useCamera) {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7, // Lower quality slightly for faster upload
        });
      } else {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      
      // Fix filename for Android
      const fileName = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image`;

      setImage(uri);
      setUploading(true);

      // 2. Create FormData
      const formData = new FormData();
      
      // ⚠️ CRITICAL FIX: The name must be 'file' to match FastAPI: file: UploadFile
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: type,
      });

      console.log("🚀 Uploading to:", BACKEND_UPLOAD_URL);

      // 3. Send to Backend with JWT token
      const response = await fetch(BACKEND_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authHeaders, // Add JWT token
        },
      });

      const responseText = await response.text();
      console.log("Server Response:", responseText);

      if (!response.ok) {
        throw new Error(`Server Error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);

      // 4. Submit Questionnaire Data to Backend
      console.log("📋 Submitting questionnaire data...");
      
      const questionnaireData = getFullQuestionnaire();
      
      // Add user info to questionnaire
      const enrichedQuestionnaireData = {
        ...questionnaireData,
        userId: cognitoAuth.userId,
        username: cognitoAuth.username,
      };
      
      // 🧪 TEST: Log what we're sending
      console.log("=" + "=".repeat(50));
      console.log("📤 SENDING TO BACKEND:");
      console.log("🆔 User ID:", cognitoAuth.userId);
      console.log("👤 Username:", cognitoAuth.username);
      console.log("📋 Full payload:", JSON.stringify(enrichedQuestionnaireData, null, 2));
      console.log("=" + "=".repeat(50));
      
      let questionnaireResponse = null;
      
      try {
        const questionnaireResult = await fetch(QUESTIONNAIRE_SUBMIT_URL, {
          method: 'POST',
          body: JSON.stringify(enrichedQuestionnaireData),
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders, // Add JWT token
          },
        });

        if (questionnaireResult.ok) {
          const questionnaireText = await questionnaireResult.text();
          questionnaireResponse = JSON.parse(questionnaireText);
          console.log("=" + "=".repeat(50));
          console.log("📥 BACKEND RESPONSE:");
          console.log(JSON.stringify(questionnaireResponse, null, 2));
          console.log("=" + "=".repeat(50));
          console.log("✅ Questionnaire submitted successfully");
          
          // Clear assessment data after successful submission
          await resetAssessment();
        } else {
          const errorText = await questionnaireResult.text();
          console.error("❌ Questionnaire submission failed:", questionnaireResult.status, errorText);
          console.warn("⚠️ Questionnaire submission failed, continuing with image results only");
        }
      } catch (questionnaireError) {
        console.error('Questionnaire submission error:', questionnaireError);
        // Continue even if questionnaire fails - user still gets image analysis
      }

      // 5. Navigate to Result Screen with Both Data Sources
      router.push({
        pathname: '/(tabs)/result',
        params: {
          // Image analysis
          analysisResult: JSON.stringify(data),
          images: [uri],
          // Questionnaire data (for display)
          ...questionnaireData.screen1,
          ...questionnaireData.screen2,
          ...questionnaireData.screen3,
          // Backend questionnaire response (GenAI recommendations)
          questionnaireResult: questionnaireResponse ? JSON.stringify(questionnaireResponse) : null,
        }
      });

    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Analysis Failed', 'Could not connect to the server. Check your IP and Wi-Fi.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Image source={require('../../assets/images/avatar.jpg')} style={styles.avatar} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Lesion Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a clear photo of the affected area. Psometric will analyze redness, thickness, and scaling.
        </Text>

        {image ? (
            <Image source={{ uri: image }} style={styles.preview} />
        ) : (
            <View style={styles.placeholderPreview}>
                <Ionicons name="scan-outline" size={80} color="#ccc" />
            </View>
        )}

        <View style={styles.buttonRow}>
          {/* Gallery Button */}
          <TouchableOpacity
            style={[styles.button, uploading && styles.buttonDisabled]}
            onPress={() => pickImageAndUpload(false)}
            disabled={uploading}
          >
            <Ionicons name="images-outline" size={24} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>

          {/* Camera Button */}
          <TouchableOpacity
            style={[styles.button, uploading && styles.buttonDisabled]}
            onPress={() => pickImageAndUpload(true)}
            disabled={uploading}
          >
            <Ionicons name="camera-outline" size={24} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
        </View>

        {uploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing Image...</Text>
          </View>
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
    width: wp(70),
    height: wp(70),
    borderRadius: 20,
    marginBottom: hp(4),
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee'
  },
  placeholderPreview: {
    width: wp(70),
    height: wp(70),
    borderRadius: 20,
    marginBottom: hp(4),
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp(4),
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(5),
    borderRadius: 15,
    minWidth: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: hp(3),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '500'
  }
});