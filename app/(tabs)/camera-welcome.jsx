import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAssessment } from '../../components/AssessmentContext';
import { useAuth } from '../../components/AuthContext';
import AvatarBottomSheet from '../../components/AvatarBottomSheet';
import History from '../../components/history';
import { hp, wp } from '../../helpers/common';
import { setTempData } from '../../helpers/dataStore';
import { getAuthHeaders, getCurrentUser } from '../../services/cognito';
import { getAssessmentForNavigation, loadAssessmentHistory } from '../../services/historyUtils';

// API URL from environment variable (.env file)
const BACKEND_ANALYZE_URL = `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.117:8000'}/analyze/`;

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
      const hasQuestionnaireData = questionnaireData && 
        (questionnaireData.screen1 || questionnaireData.screen2 || questionnaireData.screen3);
      
      if (!hasQuestionnaireData) {
        Alert.alert(
          'Missing Questionnaire',
          'Please complete the questionnaire before uploading an image.',
          [{ text: 'OK' }]
        );
        setUploading(false);
        return;
      }

      // 3. Create FormData with BOTH image and questionnaire
      const formData = new FormData();
      
      // Add image file
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: type,
      });

      // Add questionnaire as JSON string (backend will parse)
      const questionnairePayload = {
        // Flatten all screens into single object
        ...questionnaireData.screen1,
        ...questionnaireData.screen2,
        ...questionnaireData.screen3,
        // Add user info (both camelCase and snake_case to be safe)
        userId: cognitoAuth.userId,
        user_id: cognitoAuth.userId,
        username: cognitoAuth.username,
      };
      
      formData.append('questionnaire_data', JSON.stringify(questionnairePayload));

      console.log("🚀 Uploading to:", BACKEND_ANALYZE_URL);
      console.log("📤 Payload:", JSON.stringify(questionnairePayload, null, 2));

      // 4. Send SINGLE request with both image + questionnaire
      const response = await fetch(BACKEND_ANALYZE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          // 'Content-Type': 'multipart/form-data', // ❌ Don't set manually
          ...authHeaders,
        },
      });

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
        annotated_image_base64: data.annotated_image_base64,
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
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: 'transparent' },
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