import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAssessment } from '../../components/AssessmentContext';
import { useAuth } from '../../components/AuthContext';
import AvatarBottomSheet from '../../components/AvatarBottomSheet';
import History from '../../components/history';
import { setTempData } from '../../helpers/dataStore';
import { getAuthHeaders, getCurrentUser } from '../../services/cognito';
import { getAssessmentForNavigation, loadAssessmentHistory } from '../../services/historyUtils';
import styles from '../../styles/cameraWelcomeStyles';

// Backend API URL (hardcoded)
const BACKEND_ANALYZE_URL = 'http://3.24.100.128:8000/analyze/';

export default function CameraWelcome() {
  const { getFullQuestionnaire, resetAssessment } = useAssessment();
  const router = useRouter();
  const { avatar } = useAuth();

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [assessments, setAssessments] = useState([]);

  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const snapPoints = ["25%"];

  // Load history when sidebar opens
  useEffect(() => {
    if (historyVisible) {
      loadHistory();
    }
  }, [historyVisible]);

  const loadHistory = async () => {
    try {
      const formatted = await loadAssessmentHistory();
      setAssessments(formatted);
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  const handleSelectAssessment = async (assessment) => {
    try {
      setHistoryVisible(false);
      const params = await getAssessmentForNavigation(assessment);
      router.push({ pathname: '/result', params });
    } catch (error) {
      console.error('Error fetching assessment:', error);
      router.push({ pathname: '/result', params: assessment });
    }
  };

  const pickImageAndUpload = async (useCamera = false) => {
    try {
      // Get auth token before proceeding
      const authHeaders = await getAuthHeaders();
      const cognitoAuth = await getCurrentUser();
      
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

      // 2. Get questionnaire data FIRST
      const questionnaireData = getFullQuestionnaire();
      console.log("📋 Questionnaire Data:", JSON.stringify(questionnaireData, null, 2));

      // Validate questionnaire has data
      const hasQuestionnaireData = questionnaireData && questionnaireData.gender;
      
      if (!hasQuestionnaireData) {
        Alert.alert(
          'Missing Questionnaire',
          'Please complete the questionnaire before uploading an image.',
          [{ text: 'OK' }]
        );
        setUploading(false);
        return;
      }

      // 3. Create FormData with image and questionnaire
      const formData = new FormData();
      
      // Add image file
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: type,
      });

      // Add questionnaire as JSON string (backend will parse)
      const questionnairePayload = {
        ...questionnaireData,
        // Add user info (both camelCase and snake_case to be safe)
        userId: cognitoAuth.userId,
        user_id: cognitoAuth.userId,
        username: cognitoAuth.username,
      };
      
      formData.append('questionnaire_data', JSON.stringify(questionnairePayload));

      console.log("🚀 Uploading to:", BACKEND_ANALYZE_URL);
      console.log("📤 Payload:", JSON.stringify(questionnairePayload, null, 2));

      // 4. Send request with image + questionnaire (with timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(BACKEND_ANALYZE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - browser sets it with boundary
          ...authHeaders,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log("📥 Server Response:", responseText);

      if (!response.ok) {
        throw new Error(`Server Error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      // Backend returns COMPLETE result with:
      // - ML analysis (scores, annotated image)
      // - LLM-generated next steps
      // - Stored record ID
      console.log("✅ Complete analysis received:", Object.keys(data));

      // 5. Store in temp storage and navigate
      const resultId = data.assessment_id || Date.now().toString();
      
      // ML Analysis data
      setTempData(`analysis_${resultId}`, {
        global_score: data.global_score,
        diagnosis: data.diagnosis,
        erythema: data.erythema,
        induration: data.induration,
        scaling: data.scaling,
        lesions_found: data.lesions_found,
        annotated_image_url: data.annotated_image_url,
      });
      
      // LLM-generated recommendations
      setTempData(`questionnaire_${resultId}`, {
        nextSteps: data.next_steps || data.nextSteps || [],
        additionalNotes: data.additional_notes || data.additionalNotes || '',
      });

      // Clear assessment context after successful submission
      await resetAssessment();

      router.push({
        pathname: '/(tabs)/result',
        params: {
          resultId: resultId,
          images: [uri],
          // Pass questionnaire data for display in result screen
          ...questionnairePayload,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.topBar}>
            <TouchableOpacity 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setHistoryVisible(true)}
            >
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </TouchableOpacity>
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

      <History
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onSelectAssessment={handleSelectAssessment}
        assessments={assessments}
      />

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onDismiss={() => setisOpen(false)}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.45}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView>
          <AvatarBottomSheet
            onPick={(option) => {
              sheetRef.current?.dismiss();
            }}
            onClose={() => sheetRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}