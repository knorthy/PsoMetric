import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../components/AuthContext';
import AvatarBottomSheet from '../../components/AvatarBottomSheet';
import History from '../../components/history';
import { hp } from '../../helpers/common';
import { fetchAssessmentHistory, fetchAssessmentResult } from '../../services/api';
import styles from '../../styles/photoguideStyles';

// Image sets with captions
const howToTakeImages = [
  { source: require('../../assets/images/guide/p1.png'), label: 'Take images in a well-lit area' },
  { source: require('../../assets/images/guide/p2.png'), label: 'Images should be centered and not cropped' },
  { source: require('../../assets/images/guide/p3.png'), label: 'Do not put creams or cover ups' },
  { source: require('../../assets/images/guide/p4.png'), label: 'Clear and focused' },
];

const whatToUploadImages = [
  { source: require('../../assets/images/guide/p5.png'), label: 'Accepted image formats' },
  { source: require('../../assets/images/guide/p6.png'), label: 'Capture images against a plain background' },
  { source: require('../../assets/images/guide/p7.png'), label: 'Dont upload irrelevant images' },
  { source: require('../../assets/images/guide/p8.png'), label: 'No filters or edit' },
];

export default function CameraWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { avatar } = useAuth();
  const questionnaireParams = useLocalSearchParams();
  const [uploading] = useState(false);
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
      const data = await fetchAssessmentHistory();
      const list = data.assessments || (Array.isArray(data) ? data : []);
      
      const formatted = list.map((item, index) => {
        const dateStr = item.created_at || item.timestamp;
        return {
          id: item.assessment_id || item.id || String(index),
          title: dateStr 
            ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
            : `Assessment ${index + 1}`,
          created_at: dateStr,
          timestamp: dateStr,
          ...item
        };
      });
      
      formatted.sort((a, b) => {
        const dateA = a.created_at || a.timestamp;
        const dateB = b.created_at || b.timestamp;
        if (dateA && dateB) {
          return new Date(dateB) - new Date(dateA);
        }
        return 0;
      });
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
      const lookupDate = assessment.created_at || assessment.timestamp;
      
      if (lookupDate) {
        const fullResult = await fetchAssessmentResult(lookupDate);
        const questionnaire = fullResult.questionnaire || {};
        
        router.push({
          pathname: '/result',
          params: {
            global_score: fullResult.global_score,
            diagnosis: fullResult.diagnosis,
            erythema: fullResult.erythema,
            induration: fullResult.induration,
            scaling: fullResult.scaling,
            lesions_found: fullResult.lesions_found,
            annotated_image_base64: fullResult.annotated_image_base64,
            next_steps: JSON.stringify(fullResult.next_steps || []),
            additional_notes: fullResult.additional_notes,
            gender: questionnaire.gender || fullResult.gender,
            age: questionnaire.age || fullResult.age,
            psoriasisHistory: questionnaire.psoriasisHistory || fullResult.psoriasisHistory,
            location: JSON.stringify(questionnaire.location || fullResult.location || []),
            appearance: JSON.stringify(questionnaire.appearance || fullResult.appearance || []),
            size: JSON.stringify(questionnaire.size || fullResult.size || []),
            itching: questionnaire.itching || fullResult.itching || 0,
            pain: questionnaire.pain || fullResult.pain || 0,
            jointPain: questionnaire.jointPain || fullResult.jointPain,
            jointsAffected: JSON.stringify(questionnaire.jointsAffected || fullResult.jointsAffected || []),
            dailyImpact: questionnaire.dailyImpact || fullResult.dailyImpact,
            currentTreatment: questionnaire.currentTreatment || fullResult.currentTreatment,
            assessment_id: fullResult.assessment_id,
            created_at: fullResult.created_at,
          }
        });
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  };

  // Close bottom sheet when navigating away
  useEffect(() => {
    return () => {
      if (sheetRef.current) {
        sheetRef.current?.dismiss();
      }
    };
  }, []);

  const goToCamera = () => {
    router.push({
      pathname: '/camera-welcome',
      params: questionnaireParams,
    });
  };

  // Reusable component for image + label
  const GuideImageItem = ({ source, label }) => (
    <View style={styles.imageItem}>
      <Image source={source} style={styles.guideImage} resizeMode="cover" />
      <Text style={styles.imageLabel}>{label}</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Top Bar */}
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerBlue}>Let's get you</Text>{'\n'}
          <Text style={styles.headerBlue}>started!</Text>
        </Text>

        {/* Photo Guide Card – How to Take Images */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Photo Guide</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Take Images</Text>
            <View style={styles.imageGrid}>
              {howToTakeImages.map((item, index) => (
                <GuideImageItem
                  key={`how-${index}`}
                  source={item.source}
                  label={item.label}
                />
              ))}
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Ensure images are clear, centered, and well-lit; avoid cover-ups or topical applications.
            </Text>
          </View>
        </View>

        {/* Image Requirements Card */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Image Requirements</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of images to upload</Text>
            <View style={styles.imageGrid}>
              {whatToUploadImages.map((item, index) => (
                <GuideImageItem
                  key={`req-${index}`}
                  source={item.source}
                  label={item.label}
                />
              ))}
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Upload clear, relevant, and unedited photos against a plain background
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* FAB Button */}
      {!isOpen && (
        <View style={[styles.fabContainer, { paddingBottom: insets.bottom + hp(3) }]}>
          <TouchableOpacity
            style={[styles.fabButton, uploading && styles.buttonDisabled]}
            onPress={goToCamera}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size={28} color="#fff" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={28} color="#fff" />
                <Text style={styles.fabText}>Let's Get Started</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

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
        style={{ zIndex: 2000 }}
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