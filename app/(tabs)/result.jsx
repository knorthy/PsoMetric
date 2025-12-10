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
import { getTempData } from '../../helpers/dataStore';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const [historyVisible, setHistoryVisible] = useState(false);

  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
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
    questionnaireResult,     // JSON string from backend (legacy)
    analysisResult,          // JSON string from ML model (legacy)
    resultId,                // ID to fetch data from store
  } = params;

  // === Retrieve Data from Store or Params ===
  let mlAnalysis = null;
  let genAIRecommendations = null;

  // 1. Try fetching from store first (preferred for large data)
  if (resultId) {
    const storedAnalysis = getTempData(`analysis_${resultId}`);
    const storedQuestionnaire = getTempData(`questionnaire_${resultId}`);
    
    if (storedAnalysis) mlAnalysis = storedAnalysis;
    if (storedQuestionnaire) genAIRecommendations = storedQuestionnaire;
  }

  // 2. Fallback to params if not in store
  if (!mlAnalysis && analysisResult) {
    try {
      mlAnalysis = JSON.parse(analysisResult);
    } catch (e) {
      console.error('Failed to parse analysis result from params:', e);
    }
  }

  if (!genAIRecommendations && questionnaireResult) {
    try {
      genAIRecommendations = JSON.parse(questionnaireResult);
    } catch (e) {
      console.error('Failed to parse questionnaire result from params:', e);
    }
  }

  // === DEBUG LOGS ===
  console.log("=== RESULT SCREEN DATA ===");
  console.log("Result ID:", resultId);
  console.log("ML Analysis found:", !!mlAnalysis);
  if (mlAnalysis) {
    console.log("ML Analysis Keys:", Object.keys(mlAnalysis));
    console.log("ML Analysis Details:", JSON.stringify(mlAnalysis.details || mlAnalysis.subscores || "No details/subscores"));
    console.log("ML Analysis Full:", JSON.stringify(mlAnalysis, null, 2));
  }
  console.log("GenAI Recommendations found:", !!genAIRecommendations);

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

  // Determine Scores from ML or Fallback to PASI
  // Backend returns: { global_score, details: { erythema, induration, scaling }, annotated_image_base64 }
  const mlScore = mlAnalysis?.global_score || mlAnalysis?.score || mlAnalysis?.severity_score || parseFloat(pasi_score) || 0;
  // Check if we have a valid analysis result (even if score is 0, e.g. "Clear")
  const hasResult = !!mlAnalysis || parseFloat(pasi_score) > 0;
  const hasScore = hasResult;
  const displayScore = hasResult ? mlScore.toFixed(1) : '—';
  
  // Handle 'details' potentially being a JSON string or object
  let detailsObj = mlAnalysis?.details || mlAnalysis?.subscores || mlAnalysis?.symptoms || {};
  
  // Check if it's a string and try to parse it
  if (typeof detailsObj === 'string') {
    try {
      // Try standard JSON parse
      detailsObj = JSON.parse(detailsObj);
    } catch (e) {
      console.log("Standard JSON parse failed for details, trying to fix quotes...");
      try {
        // Handle Python-style dict string: {'key': val} -> {"key": val}
        const fixedStr = detailsObj.replace(/'/g, '"').replace(/None/g, 'null').replace(/False/g, 'false').replace(/True/g, 'true');
        detailsObj = JSON.parse(fixedStr);
      } catch (e2) {
        console.error("Failed to parse details string:", e2);
        detailsObj = {};
      }
    }
  }

  console.log("Parsed Details Object:", JSON.stringify(detailsObj));

  // Helper to find key case-insensitively
  const findKey = (obj, key) => {
    if (!obj || typeof obj !== 'object') return undefined;
    const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return found ? obj[found] : undefined;
  };

  let erythema = 0;
  let induration = 0;
  let scaling = 0;

  if (Array.isArray(detailsObj) && detailsObj.length > 0) {
      // If details is an array of lesions, take the maximum score for each symptom
      console.log("Details is an array of lesions. Calculating max scores...");
      erythema = Math.max(...detailsObj.map(d => d.erythema || d.redness || 0));
      induration = Math.max(...detailsObj.map(d => d.induration || d.thickness || 0));
      scaling = Math.max(...detailsObj.map(d => d.desquamation || d.scaling || d.flaking || 0));
  } else {
      // Subscores (Default to 0 if not found)
      // We check for medical terms (Erythema) and common terms (Redness)
      erythema = findKey(detailsObj, 'erythema') || findKey(detailsObj, 'redness') || findKey(mlAnalysis, 'erythema') || 0;
      induration = findKey(detailsObj, 'induration') || findKey(detailsObj, 'thickness') || findKey(mlAnalysis, 'induration') || 0;
      scaling = findKey(detailsObj, 'scaling') || findKey(detailsObj, 'desquamation') || findKey(detailsObj, 'flaking') || findKey(mlAnalysis, 'scaling') || findKey(mlAnalysis, 'desquamation') || 0;
  }

  console.log("Resolved Subscores:", { erythema, induration, scaling });

  // Severity Logic (Adjusted for 0-10 scale if ML is used, or 0-72 if PASI)
  // If score is small (<10), assume it's the 0-10 scale. If larger, assume PASI.
  const isTenScale = mlScore <= 10; 
  const maxScore = isTenScale ? 10 : 72;

  let severity = { text: 'Pending', color: '#999999' };

  if (mlAnalysis?.diagnosis) {
      const d = mlAnalysis.diagnosis.toLowerCase();
      if (d === 'clear') severity = { text: 'Clear', color: '#34C759' };
      else if (d === 'mild') severity = { text: 'Mild', color: '#34C759' };
      else if (d === 'moderate') severity = { text: 'Moderate', color: '#FF9F0A' };
      else if (d === 'severe') severity = { text: 'Severe', color: '#FF3B30' };
      else severity = { text: mlAnalysis.diagnosis, color: '#007AFF' };
  } else if (hasResult) {
      if (isTenScale) {
          if (mlScore < 1) severity = { text: 'Clear', color: '#34C759' };
          else if (mlScore < 3) severity = { text: 'Mild', color: '#34C759' };
          else if (mlScore < 7) severity = { text: 'Moderate', color: '#FF9F0A' };
          else severity = { text: 'Severe', color: '#FF3B30' };
      } else {
          if (mlScore < 10) severity = { text: 'Mild', color: '#34C759' };
          else if (mlScore < 20) severity = { text: 'Moderate', color: '#FF9F0A' };
          else severity = { text: 'Severe', color: '#FF3B30' };
      }
  }

  const imageList = images ? (Array.isArray(images) ? images : [images]) : [];
  // Use annotated image from ML if available, otherwise first uploaded image
  const displayImage = mlAnalysis?.annotated_image_base64 || mlAnalysis?.annotated_image || mlAnalysis?.annotated_image_url || imageList[0];

  // Parse backend questionnaire response
  // (Already handled above via store or params)

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

        {/* Global Severity Score Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>GLOBAL SEVERITY SCORE</Text>
          <Text style={styles.summaryMainScore}>{displayScore}</Text>
          <Text style={styles.outOf72}>out of {maxScore.toFixed(1)}</Text>
          
          <View style={[styles.severityPill, { backgroundColor: severity.color + '20' }]}>
            <Text style={[styles.severityPillText, { color: severity.color }]}>
              {hasScore ? (severity.text === 'Clear' ? 'No Psoriasis Detected' : `${severity.text} Psoriasis`) : 'Assessment Incomplete'}
            </Text>
          </View>
          
          <Text style={styles.summaryDescription}>
            {hasScore 
              ? (severity.text === 'Clear' 
                  ? 'AI analysis did not detect any signs of psoriasis in the uploaded image.'
                  : `AI analysis indicates a ${severity.text.toLowerCase()} condition level based on lesion area and symptom intensity.`)
              : 'Complete the assessment to get a severity score.'}
          </Text>
        </View>

        {/* AI Lesion Analysis */}
        <Text style={styles.sectionTitle}>AI Lesion Analysis</Text>
        <View style={styles.aiAnalysisCard}>
          {displayImage ? (
            <View style={styles.analysisImageContainer}>
              <Image 
                source={{ uri: displayImage.startsWith('http') || displayImage.startsWith('file') ? displayImage : `data:image/jpeg;base64,${displayImage}` }} 
                style={styles.analysisImage} 
                resizeMode="cover" 
              />
              {/* Overlay boxes could be drawn here if coordinates were available separately, but assuming image is pre-annotated */}
            </View>
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text style={{color: '#999'}}>No image analyzed</Text>
            </View>
          )}
          <Text style={styles.segmentationNote}>⊕ Segmentation View: The AI detected {mlAnalysis?.lesions_found || mlAnalysis?.lesion_count || 'multiple'} lesion(s) (highlighted).</Text>

          <Text style={styles.subSectionTitle}>Symptom Breakdown</Text>
          
          {/* Erythema */}
          <View style={styles.symptomRow}>
            <View style={styles.symptomHeader}>
              <Text style={styles.symptomLabel}>Erythema (Redness)</Text>
              <Text style={[styles.symptomScore, {color: '#FF3B30'}]}>{erythema}/4</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(erythema/4)*100}%`, backgroundColor: '#FF3B30' }]} />
            </View>
          </View>

          {/* Induration */}
          <View style={styles.symptomRow}>
            <View style={styles.symptomHeader}>
              <Text style={styles.symptomLabel}>Induration (Thickness)</Text>
              <Text style={[styles.symptomScore, {color: '#007AFF'}]}>{induration}/4</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(induration/4)*100}%`, backgroundColor: '#007AFF' }]} />
            </View>
          </View>

          {/* Desquamation */}
          <View style={styles.symptomRow}>
            <View style={styles.symptomHeader}>
              <Text style={styles.symptomLabel}>Desquamation (Scaling)</Text>
              <Text style={[styles.symptomScore, {color: '#8E8E93'}]}>{scaling}/4</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(scaling/4)*100}%`, backgroundColor: '#8E8E93' }]} />
            </View>
          </View>
        </View>

        {/* Patient Context */}
        {/* Patient Context */}
        <Text style={styles.sectionTitle}>Patient Context</Text>
        <View style={styles.quickFacts}>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Age</Text>
            <Text style={styles.factValue}>{show(age, '-')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Gender</Text>
            <Text style={styles.factValue}>{show(gender, '-')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Impact</Text>
            <Text style={styles.factValue}>{show(daily_impact, 'Not specified')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Joint Pain</Text>
            <Text style={styles.factValue}>{yesNo(joint_pain) === 'Yes' ? 'Present' : 'Not specified'}</Text>
          </View>
        </View>

        {/* Detailed Report */}
        <Text style={styles.sectionTitle}>Detailed Report</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{list(location)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Itching Level</Text><Text style={styles.detailValue}>{show(itching, '0')}/10</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Bleeding</Text><Text style={styles.detailValue}>{show(bleeding, '0')}/10</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Triggers</Text><Text style={styles.detailValue}>{list(triggers)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Stress Factor</Text><Text style={styles.detailValue}>{yesNo(worsen_with_stress)}</Text></View>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Next Steps</Text>
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

  // === NEW STYLES FOR AI ANALYSIS ===
  aiAnalysisCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: wp(5),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: '#E5E5FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analysisImageContainer: {
    width: '100%',
    height: hp(30),
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: hp(2),
    backgroundColor: '#f0f0f0',
  },
  analysisImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: hp(20),
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  segmentationNote: {
    fontSize: hp(1.8),
    color: '#666',
    fontStyle: 'italic',
    marginBottom: hp(1),
  },
  symptomRow: {
    marginBottom: hp(2),
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },
  symptomLabel: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#444',
  },
  symptomScore: {
    fontSize: hp(2),
    fontWeight: '700',
  },
  progressBarBg: {
    height: hp(1.2),
    backgroundColor: '#EFEFF4',
    borderRadius: hp(1),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: hp(1),
  },
});