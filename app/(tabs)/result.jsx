import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AvatarBottomSheet from '../../components/AvatarBottomSheet.jsx';
import History from '../../components/history';
import { hp, wp } from '../../helpers/common';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const [historyVisible, setHistoryVisible] = useState(false);

  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const snapPoints = ["25%"];

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  // === All data from previous screens (passed via router.push params) ===
  const {
    // From assessment.jsx (page 1)
    gender,
    age,
    psoriasis_history, // 'first' | 'recurrent'
    location = [],           // array
    appearance = [],         // array
    size = [],               // array
    nails = [],              // array
    scalp = [],              // array

    // From assess2.jsx (page 2)
    onset_date,
    symptom_pattern,         // 'continuous' | 'intermittent'
    lesion_speed,            // 'gradual' | 'rapid'
    itching = 0,
    burning = 0,
    pain = 0,
    bleeding = 0,
    worsen_at_night,         // 'yes' | 'no'
    worsen_with_stress,      // 'yes' | 'no'
    triggers = [],           // array
    med_triggers = [],       // array
    sunlight_effect,         // 'sunlight' | 'winter' | 'none'

    // From assess3.jsx (page 3)
    daily_impact,
    emotional_impact,
    relationships_impact,
    joint_pain,              // 'yes' | 'no'
    joints_affected = [],    // array
    nail_with_joint,         // 'yes' | 'no'
    past_treatments,
    family_history = [],     // array
    other_conditions = [],   // array
    current_treatment,
    relief_side_effects,
    tried_systemic,          // 'yes' | 'no'
    fever_infection,         // 'yes' | 'no'
    weight_loss_fatigue,     // 'yes' | 'no'

    // From assess4.jsx (camera) + photoguide
    images,                  // string or array of URIs
    pasi_score = '0',        // string from backend or calculated
    
    // NEW: Backend questionnaire response with GenAI recommendations
    questionnaireResult,     // JSON string from backend
  } = params;

  // === Helper Functions ===
  const show = (value, fallback = 'Not provided') => value || fallback;
  const yesNo = (value) => (value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'Not specified');
  const list = (arr) => {
    if (!arr) return 'None';
    if (Array.isArray(arr)) return arr.length > 0 ? arr.join(', ') : 'None';
    // Handle comma-separated strings if backend returns them that way
    if (typeof arr === 'string' && arr.includes(',')) return arr.split(',').join(', ');
    return String(arr);
  };

  const formatList = (arr) => arr && arr.length > 0 ? arr.join(', ') : 'None';

  // PASI Score Handling
  const rawScore = parseFloat(pasi_score) || 0;
  const hasScore = rawScore > 0;

  const severity = hasScore
    ? rawScore < 10
      ? { text: 'Mild', color: '#34C759' }
      : rawScore < 20
      ? { text: 'Moderate', color: '#FF9F0A' }
      : { text: 'Severe', color: '#FF3B30' }
    : { text: 'Pending', color: '#999999' };

  const displayScore = hasScore ? rawScore.toFixed(1) : '—';
  const imageList = images ? (Array.isArray(images) ? images : [images]) : [];

  // Parse backend questionnaire response
  let genAIRecommendations = null;
  try {
    if (questionnaireResult) {
      genAIRecommendations = JSON.parse(questionnaireResult);
    }
  } catch (e) {
    console.error('Failed to parse questionnaire result:', e);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity hitSlop={20} onPress={() => setHistoryVisible(true)}>
              <Ionicons name="menu" size={30} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
              <Image source={require('../../assets/images/avatar.jpg')} style={styles.avatar} />
            </TouchableOpacity>
          </View>

      <Text style={styles.pageTitle}>Assessment Result</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* PASI Score Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryMainScore}>{displayScore}</Text>
          <Text style={styles.outOf72}>out of 72</Text>
          <View style={[styles.severityPill, { backgroundColor: severity.color }]}>
            <Text style={styles.severityPillText}>
              {hasScore ? `${severity.text} Psoriasis` : 'Assessment Incomplete'}
            </Text>
          </View>
          <Text style={styles.summaryDescription}>
  {hasScore ? (
    severityDescription
  ) : (
    <>
      {/* This empty View adds extra space only in the "no data" case */}
      <View style={{ height: hp(5.2) }} />
      <Text style={{ fontSize: hp(1.9), color: '#999', textAlign: 'center' }}>
        Severity not assessed yet
      </Text>
    </>
  )}
</Text>
        </View>

        {/* Quick Facts */}
        <View style={styles.quickFacts}>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Age</Text>
            <Text style={styles.factValue}>{show(age, '—')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Gender</Text>
            <Text style={styles.factValue}>{show(gender, '—')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Daily Impact</Text>
            <Text style={styles.factValue}>{show(daily_impact, '—')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Joint Pain</Text>
            <Text style={styles.factValue}>{yesNo(joint_pain) === 'Yes' ? 'Present' : 'None'}</Text>
          </View>
        </View>

        {/* Detailed Summary */}
        <Text style={styles.sectionTitle}>Detailed Symptom Summary</Text>
        <View style={styles.detailCard}>

          <Text style={styles.subSectionTitle}>Basic Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Psoriasis History</Text>
            <Text style={styles.detailValue}>
              {psoriasis_history === 'first' ? 'First onset' : psoriasis_history === 'recurrent' ? 'Recurrent' : 'Not provided'}
            </Text>
          </View>

          <Text style={styles.subSectionTitle}>Lesion Characteristics</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{list(location)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Appearance</Text><Text style={styles.detailValue}>{list(appearance)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Size of the Affected Area</Text><Text style={styles.detailValue}>{list(size)}</Text></View>

          <Text style={styles.subSectionTitle}>Symptom Severity (0–10)</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Itching</Text><Text style={styles.detailValue}>{show(itching, '—')}/10</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Pain</Text><Text style={styles.detailValue}>{show(pain, '—')}/10</Text></View>

          <Text style={styles.subSectionTitle}>Quality of Life Impact</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Daily activities</Text><Text style={styles.detailValue}>{show(daily_impact, '—')}</Text></View>

          {joint_pain === 'yes' && (
            <>
              <Text style={styles.subSectionTitle}>Joint Symptoms (Psoriatic Arthritis Risk)</Text>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Affected joints</Text><Text style={styles.detailValue}>{formatList(joints_affected)}</Text></View>
            </>
          )}

          <Text style={styles.subSectionTitle}>Treatment</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Current treatment</Text><Text style={styles.detailValue}>{show(current_treatment, 'None')}</Text></View>
        </View>

        {/* AI Lesion Analysis */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>Lesion Analysis</Text>
          {imageList.length > 0 && (
            <TouchableOpacity 
              style={styles.overlayToggle} 
              onPress={() => setShowOverlay(!showOverlay)}
            >
              <Ionicons 
                name={showOverlay ? "eye" : "eye-off"} 
                size={20} 
                color="#007AFF" 
              />
              <Text style={styles.overlayToggleText}>
                {showOverlay ? 'Hide' : 'Show'} Detection
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {imageList.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: hp(4) }}>
            {imageList.map((uri, i) => (
              <View key={i} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} resizeMode="cover" />
                {showOverlay && (
                  <View style={styles.detectionOverlay}>
                    {/* This represents the AI detection box overlay */}
                    <View style={styles.detectionBox} />
                  </View>
                )}
                <View style={styles.imageLabelContainer}>
                  <Text style={styles.imageLabel}>Photo {i + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImagesCard}>
            <Ionicons name="camera-outline" size={40} color="#ccc" />
            <Text style={styles.noImagesText}>No photos uploaded</Text>
          </View>
        )}

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
        <View style={styles.recommendationsCard}>
          {genAIRecommendations && genAIRecommendations.nextSteps ? (
            <>
              <Text style={styles.recSectionTitle}>🤖 AI-Generated Next Steps</Text>
              {genAIRecommendations.nextSteps.map((step, index) => (
                <Text key={index} style={styles.recItem}>• {step}</Text>
              ))}
              {genAIRecommendations.additionalNotes && (
                <>
                  <Text style={[styles.recSectionTitle, { marginTop: hp(2) }]}>📝 Additional Notes</Text>
                  <Text style={styles.recNote}>{genAIRecommendations.additionalNotes}</Text>
                </>
              )}
            </>
          ) : hasScore ? (
            <>
              <Text style={styles.recItem}>• Continue moisturizing daily with fragrance-free emollients</Text>
              <Text style={styles.recItem}>• Consider topical corticosteroids or vitamin D analogues</Text>
              <Text style={styles.recItem}>• Avoid known triggers: stress, smoking, alcohol</Text>
              {joint_pain === 'yes' && <Text style={styles.recItem}>• Discuss possible psoriatic arthritis with your doctor</Text>}
            </>
          ) : (
            <Text style={{
              fontSize: hp(1.95),
              fontStyle: 'italic',
              color: '#999',
              textAlign: 'center',
              lineHeight: hp(3.1),
            }}>
              • Complete your assessment to receive your personalized treatment suggestions.
            </Text>
          )}
        </View>

        <View style={{ height: hp(14) }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnSecondary}>
          <Ionicons name="download-outline" size={22} color="#007AFF" />
          <Text style={styles.btnTextSecondary}>Save as PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
          <Text style={styles.btnTextPrimary}>Share Report</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>

    <History visible={historyVisible} onClose={() => setHistoryVisible(false)} />

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
  </BottomSheetModalProvider>
</GestureHandlerRootView>
);
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },

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

  avatar: { 
    width: '100%', 
    height: '100%' 
  },

  pageTitle: {
    fontSize: hp(3.4),
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: hp(3),
  },

  scrollContent: { 
    paddingHorizontal: wp(6), 
    paddingBottom: hp(15) 
  },

  summaryCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 28,
    paddingVertical: hp(5),
    alignItems: 'center',
    marginBottom: hp(4),
    borderWidth: 1.5,
    borderColor: '#E0ECFF',
  },

  summaryMainScore: { 
    fontSize: hp(8), 
    fontWeight: '900', 
    color: '#003087' 
  },

  outOf72: { 
    fontSize: hp(2.4), 
    color: '#888', 
    marginBottom: hp(3) 
  },

  severityPill: { 
    paddingHorizontal: wp(6), 
    paddingVertical: hp(1.2), 
    borderRadius: 30, 
    MarginBottom: hp(3) 
  },

  severityPillText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: hp(2.2) 
  },

  summaryDescription: { 
    fontSize: hp(2.2), 
    color: '#444', 
    textAlign: 'center', 
    lineHeight: hp(3.2), 
    paddingHorizontal: wp(6) 
  },

  quickFacts: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: hp(4) 
  },

  factBox: {
    width: '48%',
    backgroundColor: '#F7F7FC',
    borderRadius: 20,
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
    alignItems: 'center',
  },

  factLabel: { 
    fontSize: hp(1.9), 
    color: '#666', 
    marginBottom: hp(0.8) 
  },

  factValue: { 
    fontSize: hp(2.4), 
    fontWeight: '600', 
    color: '#333' 
  },

  sectionTitle: {
    fontSize: hp(2.8),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(2),
    marginTop: hp(4),
  },

  subSectionTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#007AFF',
    marginTop: hp(3),
    marginBottom: hp(1.5),
  },

  detailCard: {
    backgroundColor: '#F9F9FE',
    borderRadius: 20,
    padding: wp(5),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: '#E5E5FF',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },

  detailLabel: { 
    fontSize: hp(2), 
    color: '#555', 
    flex: 1 
  },

  detailValue: { 
    fontSize: hp(2), 
    color: '#000', 
    fontWeight: '600', 
    textAlign: 'right', 
    flex: 1 
  },

  imagesScroll: { 
    marginBottom: hp(4) 
  },

  imageContainer: {
    width: wp(65),
    height: wp(85),
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: wp(4),
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },

  uploadedImage: { 
    width: '100%', 
    height: '100%' 
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
    padding: wp(3),
  },

  imageLabel: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: hp(1.9) 
  },

  imageLabelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: wp(3),
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(4),
  },

  overlayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },

  overlayToggleText: {
    color: '#007AFF',
    fontSize: hp(1.6),
    fontWeight: '600',
    marginLeft: wp(1.5),
  },

  detectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detectionBox: {
    width: '60%',
    height: '50%',
    borderWidth: 3,
    borderColor: 'rgba(0, 122, 255, 0.8)',
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    borderRadius: 4,
  },

  noImagesCard: {
    height: wp(85),
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    marginBottom: hp(4),
  },

  noImagesText: { 
    marginTop: hp(2), 
    color: '#aaa', 
    fontSize: hp(2.1) 
  },

  recommendationsCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 24,
    paddingVertical: hp(3.5),
    paddingHorizontal: wp(6),
    marginBottom: hp(3),
    borderWidth: 1.5,
    borderColor: '#D6EBFF',
  },

  recSectionTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: hp(1.5),
  },

  recItem: { 
    fontSize: hp(2.2), 
    color: '#333', 
    lineHeight: hp(3.4), 
    marginBottom: hp(1) 
  },

  recNote: {
    fontSize: hp(2),
    color: '#555',
    lineHeight: hp(2.8),
    fontStyle: 'italic',
  },

  alwaysRec: { 
    marginTop: hp(2.5), 
    paddingTop: hp(2.5), 
    borderTopWidth: 1, 
    borderTopColor: '#B8DCFF' 
  },
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: hp(2),
    marginRight: wp(3),
  },

  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: hp(2),
  },

  btnTextSecondary: { 
    color: '#007AFF', 
    fontWeight: '600', 
    fontSize: hp(2.2), 
    marginLeft: wp(2) 
  },

  btnTextPrimary: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: hp(2.2), 
    marginLeft: wp(2) 
},
});