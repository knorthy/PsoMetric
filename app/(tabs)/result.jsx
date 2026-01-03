import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from '../../components/AuthContext.jsx';
import AvatarBottomSheet from '../../components/AvatarBottomSheet.jsx';
import History from '../../components/history';
import { hp } from '../../helpers/common';
import { getTempData } from '../../helpers/dataStore';
import { getAssessmentForNavigation, loadAssessmentHistory } from '../../services/historyUtils';
import styles from '../../styles/resultStyles';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [assessments, setAssessments] = useState([]);

  const { avatar } = useAuth();

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

  const handleSelectAssessment = async (assessment) => {
    try {
      setHistoryVisible(false);
      const params = await getAssessmentForNavigation(assessment);
      router.replace({ pathname: '/result', params });
    } catch (error) {
      console.error('Error fetching assessment:', error);
      router.replace({ pathname: '/result', params: assessment });
    }
  };

  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  // Toggle for showing/hiding ML overlay (annotated image)
  const [showOverlay, setShowOverlay] = useState(true);
  const snapPoints = ["25%"];

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  // === All data from questionnaire (single-page condensed version) ===
  // Helper to parse arrays that may come as JSON strings from router params
  const parseArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // Might be comma-separated
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const {
    // Demographics
    gender,
    age,
    psoriasisHistory,        // 'first' | 'recurrent'
    
    // Symptoms - Location & Appearance (may be JSON strings from router)
    location: locationRaw,
    appearance: appearanceRaw,
    size: sizeRaw,
    
    // Severity Ratings
    itching = 0,             // 0-10 slider
    pain = 0,                // 0-10 slider
    
    // Impact & Joints
    jointPain,               // 'yes' | 'no'
    jointsAffected: jointsAffectedRaw,
    dailyImpact,             // 'none' | 'mild' | 'moderate' | 'severe'
    currentTreatment,        // string (free text)

    // Image data
    images,                  // string or array of URIs
    
    // Backend response
    resultId,                // ID to fetch data from store
    
    // Legacy/Fallback params
    analysisResult,
    questionnaireResult,
    pasi_score = '0',
  } = params;

  // Parse arrays from router params
  const location = parseArray(locationRaw);
  const appearance = parseArray(appearanceRaw);
  const size = parseArray(sizeRaw);
  const jointsAffected = parseArray(jointsAffectedRaw);

  // === Retrieve Data from Store ===
  let mlAnalysis = null;
  let genAIRecommendations = null;

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

  // 3. Construct from direct params (History/Backend response)
  if (!mlAnalysis && (params.global_score !== undefined || params.diagnosis)) {
    mlAnalysis = {
      global_score: params.global_score,
      diagnosis: params.diagnosis,
      erythema: params.erythema,
      induration: params.induration,
      scaling: params.scaling,
      lesions_found: params.lesions_found,
      annotated_image_url: params.annotated_image_url,
      // Handle potential legacy fields
      details: params.details,
    };
  }

  if (!genAIRecommendations && (params.next_steps || params.nextSteps)) {
    // Handle array passed via params (might be stringified or array)
    let steps = params.next_steps || params.nextSteps;
    if (typeof steps === 'string' && steps.startsWith('[')) {
      try { steps = JSON.parse(steps); } catch (e) {}
    }
    
    genAIRecommendations = {
      nextSteps: Array.isArray(steps) ? steps : [steps],
      additionalNotes: params.additional_notes || params.additionalNotes,
    };
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
  const rawScore = mlAnalysis?.global_score ?? mlAnalysis?.score ?? mlAnalysis?.severity_score ?? pasi_score ?? 0;
  const mlScore = parseFloat(rawScore) || 0;
  
  // Check if we have a valid analysis result (even if score is 0, e.g. "Clear")
  const hasResult = !!mlAnalysis || mlScore > 0;
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
  // Choose annotated image and original image
  const annotatedImage = mlAnalysis?.annotated_image_url;
  const originalImage = imageList[0];
  
  // Debug image URLs
  console.log("🖼️ Annotated Image URL:", annotatedImage);
  console.log("🖼️ Original Image:", originalImage);
  
  // Show annotated image when overlay enabled and annotated image exists, otherwise show original upload
  const displayImage = (showOverlay && annotatedImage) ? annotatedImage : (originalImage || annotatedImage || null);
  console.log("🖼️ Display Image:", displayImage);

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
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
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
        <Text style={styles.sectionTitle}>Lesion Analysis</Text>
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
          <View style={styles.overlayToggleRow}>
            <Text style={styles.overlayToggleLabel}>{showOverlay ? 'Overlay: On' : 'Overlay: Off'}</Text>
            <Switch
              value={showOverlay}
              onValueChange={(v) => setShowOverlay(v)}
            />
          </View>

          <Text style={styles.segmentationNote}>⊕ Segmentation View: The PsoMetric detected {mlAnalysis?.lesions_found || mlAnalysis?.lesion_count || 'multiple'} lesion(s) (highlighted).</Text>

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
            <Text style={styles.factValue}>{show(dailyImpact, 'Not specified')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Joint Pain</Text>
            <Text style={styles.factValue}>{jointPain === 'yes' ? 'Present' : 'None'}</Text>
          </View>
        </View>

        {/* Detailed Report */}
        <Text style={styles.sectionTitle}>Detailed Report</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{list(location)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Gender</Text><Text style={styles.detailValue}>{show(gender, '-')}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Age</Text><Text style={styles.detailValue}>{show(age, '-')}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>History</Text><Text style={styles.detailValue}>{psoriasisHistory === 'first' ? 'First onset' : psoriasisHistory === 'recurrent' ? 'Recurrent' : 'Not specified'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Appearance</Text><Text style={styles.detailValue}>{list(appearance)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Size</Text><Text style={styles.detailValue}>{list(size)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Itching Level</Text><Text style={styles.detailValue}>{show(itching, '0')}/10</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Pain Level</Text><Text style={styles.detailValue}>{show(pain, '0')}/10</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Daily Impact</Text><Text style={styles.detailValue}>{show(dailyImpact, 'Not specified')}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Joint Pain</Text><Text style={styles.detailValue}>{jointPain === 'yes' ? 'Yes' : jointPain === 'no' ? 'No' : 'Not specified'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Joints Affected</Text><Text style={styles.detailValue}>{list(jointsAffected)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Current Treatment</Text><Text style={styles.detailValue}>{show(currentTreatment, 'None')}</Text></View>
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
              {jointPain === 'yes' && <Text style={styles.recItem}>• Discuss possible psoriatic arthritis with your doctor</Text>}
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
  </BottomSheetModalProvider>
</GestureHandlerRootView>
);
}