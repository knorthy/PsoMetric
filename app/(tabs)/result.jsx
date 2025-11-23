import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { hp, wp } from '../../helpers/common';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // --- 1. PARSE AI RESULTS ---
  let analysis = null;
  try {
    if (params.analysisResult) {
      analysis = JSON.parse(params.analysisResult);
    }
  } catch (e) {
    console.error("Error parsing analysis result:", e);
  }

  // Safe defaults
  const globalScore = analysis?.global_score || 0;
  const diagnosis = analysis?.diagnosis || 'Pending';
  const annotatedImageBase64 = analysis?.annotated_image_base64 || null;
  const lesions = analysis?.details || [];
  
  // Get primary lesion metrics (if exists)
  const primaryLesion = lesions.length > 0 ? lesions[0] : null;

  // --- 2. HELPER FUNCTIONS ---
  const fmt = (val, fallback = 'Not specified') =>
    val && val !== '' ? (Array.isArray(val) ? val.join(', ') : val) : fallback;

  const fmtYesNo = (val) => (val === 'yes' ? 'Yes' : val === 'no' ? 'No' : 'Not specified');

  const fmtList = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : 'None');

  // Severity Colors (0-10 Scale)
  const getSeverityStyle = (score) => {
    if (score < 4.0) return { text: 'Mild', color: '#34C759', bg: '#E8F8ED' };      // Green
    if (score < 7.5) return { text: 'Moderate', color: '#FF9F0A', bg: '#FFF5E5' };  // Orange
    return { text: 'Severe', color: '#FF3B30', bg: '#FFEBEA' };                     // Red
  };

  const { text: severityText, color: severityColor, bg: severityBg } = getSeverityStyle(globalScore);

  // Questionnaire Data Extraction
  const {
    gender, age, psoriasisHistory, location, appearance, size, nails, scalp,
    onsetDate, symptomPattern, lesionSpeed, itching, burning, pain, bleeding,
    worsenAtNight, worsenWithStress, triggers, medTriggers, sunlightEffect,
    dailyImpact, emotionalImpact, relationshipsImpact, jointPain, jointsAffected, nailWithJoint,
    pastTreatments, familyHistory, otherConditions, currentTreatment, reliefSideEffects, triedSystemic,
    feverInfection, weightLossFatigue, images,
  } = params;

  const dailyImpactText = { none: 'None', mild: 'Mild', moderate: 'Moderate', severe: 'Severe' }[dailyImpact] || 'Not specified';
  const historyText = psoriasisHistory === 'first' ? 'First onset' : psoriasisHistory === 'recurrent' ? 'Recurrent' : 'Not specified';
  
  // Handle local user uploaded images for display
  const uploadedImages = images ? (Array.isArray(images) ? images : [images]) : [];

  // --- 3. COMPONENT: SCORE BAR ---
  const ScoreBar = ({ label, score, color }) => (
    <View style={styles.scoreBarWrapper}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={[styles.scoreValue, { color: color }]}>{score}/4</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(score / 4) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={20} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Result</Text>
        <View style={styles.avatarContainer}>
          <Image source={require('../../assets/images/avatar.jpg')} style={styles.avatar} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- MAIN DIAGNOSIS CARD --- */}
        <View style={styles.mainCard}>
          <Text style={styles.scoreTitle}>Global Severity Score</Text>
          <Text style={[styles.bigScore, { color: severityColor }]}>{globalScore.toFixed(1)}</Text>
          <Text style={styles.scaleText}>out of 10.0</Text>
          
          <View style={[styles.badge, { backgroundColor: severityBg }]}>
            <Text style={[styles.badgeText, { color: severityColor }]}>{diagnosis} Psoriasis</Text>
          </View>
          
          <Text style={styles.summaryText}>
            AI analysis indicates a <Text style={{ fontWeight: '700', color: '#333' }}>{diagnosis.toLowerCase()}</Text> condition level based on lesion area and symptom intensity.
          </Text>
        </View>

        {/* --- AI VISUAL ANALYSIS (HEATMAP) --- */}
        <Text style={styles.sectionHeader}>AI Lesion Analysis</Text>
        <View style={styles.visualCard}>
          {annotatedImageBase64 ? (
            <View>
                <Image 
                    // ⚠️ CRITICAL: Prepend data URI scheme
                    source={{ uri: `data:image/jpeg;base64,${annotatedImageBase64}` }} 
                    style={styles.heatmapImage} 
                    resizeMode="contain"
                />
                <Text style={styles.caption}>
                  <Ionicons name="scan-circle-outline" size={14} /> Segmentation View: The AI detected {analysis?.lesions_found} lesion(s) (highlighted).
                </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
                <Ionicons name="image-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No visual analysis generated.</Text>
            </View>
          )}

          {/* --- SUB-SCORES (E/I/D) --- */}
          {primaryLesion && (
            <View style={styles.metricsBox}>
              <Text style={styles.metricsTitle}>Symptom Breakdown</Text>
              <ScoreBar label="Erythema (Redness)" score={primaryLesion.erythema} color="#FF3B30" />
              <ScoreBar label="Induration (Thickness)" score={primaryLesion.induration} color="#007AFF" />
              <ScoreBar label="Desquamation (Scaling)" score={primaryLesion.desquamation} color="#8E8E93" />
            </View>
          )}
        </View>

        {/* --- PATIENT CONTEXT --- */}
        <Text style={styles.sectionHeader}>Patient Context</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Age</Text>
            <Text style={styles.gridValue}>{fmt(age, '-')}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Gender</Text>
            <Text style={styles.gridValue}>{fmt(gender, '-')}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Impact</Text>
            <Text style={styles.gridValue}>{dailyImpactText}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Joint Pain</Text>
            <Text style={styles.gridValue}>{fmtYesNo(jointPain)}</Text>
          </View>
        </View>

        {/* --- DETAILED REPORT --- */}
        <Text style={styles.sectionHeader}>Detailed Report</Text>
        <View style={styles.detailsCard}>
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Location</Text>
                <Text style={styles.rowValue}>{fmtList(location)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Itching Level</Text>
                <Text style={styles.rowValue}>{fmt(itching, '0')}/10</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Bleeding</Text>
                <Text style={styles.rowValue}>{fmt(bleeding, '0')}/10</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Triggers</Text>
                <Text style={styles.rowValue}>{fmtList(triggers)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Stress Factor</Text>
                <Text style={styles.rowValue}>{fmtYesNo(worsenWithStress)}</Text>
            </View>
        </View>

        {/* --- RECOMMENDATIONS --- */}
        <Text style={styles.sectionHeader}>Next Steps</Text>
        <View style={styles.recCard}>
            <View style={styles.recContent}>
                {globalScore < 4.0 && (
                    <Text style={styles.recText}>
                        • Continue topical treatments (moisturizers, mild steroids).{"\n"}
                        • Focus on stress management to prevent flare-ups.
                    </Text>
                )}
                {globalScore >= 4.0 && globalScore < 7.5 && (
                    <Text style={styles.recText}>
                        • Consider discussing Phototherapy (UVB) with your dermatologist.{"\n"}
                        • Review current topicals; they may need adjustment.
                    </Text>
                )}
                {globalScore >= 7.5 && (
                    <Text style={styles.recText}>
                        • High severity suggests potential need for systemic therapy or biologics.{"\n"}
                        • Closely monitor joint pain for psoriatic arthritis.
                    </Text>
                )}
                <Text style={[styles.recText, {marginTop: 10, fontStyle:'italic', fontSize: hp(1.8), color:'#666'}]}>
                    Note: This AI assessment is a screening tool, not a medical diagnosis. Please consult a specialist.
                </Text>
            </View>
        </View>

        <View style={{ height: hp(12) }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.outlineBtn}>
            <Ionicons name="download-outline" size={20} color="#007AFF" />
            <Text style={styles.outlineBtnText}>Save PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filledBtn}>
            <Ionicons name="share-outline" size={20} color="#FFF" />
            <Text style={styles.filledBtnText}>Share Report</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Light gray background for contrast
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'android' ? hp(4) : hp(1),
    paddingBottom: hp(2),
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#333',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: wp(5),
  },
  
  // Main Score Card
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: wp(6),
    alignItems: 'center',
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: hp(1.8),
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1),
  },
  bigScore: {
    fontSize: hp(6.5),
    fontWeight: '800',
    lineHeight: hp(7),
  },
  scaleText: {
    fontSize: hp(1.8),
    color: '#999',
    marginBottom: hp(2),
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: hp(2),
  },
  badgeText: {
    fontWeight: '700',
    fontSize: hp(1.8),
  },
  summaryText: {
    textAlign: 'center',
    fontSize: hp(1.9),
    color: '#555',
    lineHeight: hp(2.6),
  },

  // Section Headers
  sectionHeader: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: hp(1.5),
    marginLeft: wp(1),
  },

  // Visual Card
  visualCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: wp(4),
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heatmapImage: {
    width: '100%',
    height: hp(32),
    borderRadius: 12,
    marginBottom: hp(1.5),
    backgroundColor: '#F3F4F6',
  },
  caption: {
    fontSize: hp(1.6),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  emptyState: {
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: hp(1.8),
  },

  // Metrics
  metricsBox: {
    marginTop: hp(1),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metricsTitle: {
    fontSize: hp(1.9),
    fontWeight: '600',
    color: '#374151',
    marginBottom: hp(1.5),
  },
  scoreBarWrapper: {
    marginBottom: hp(1.5),
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: hp(1.8),
    color: '#4B5563',
  },
  scoreValue: {
    fontSize: hp(1.8),
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },

  // Grid Facts
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: wp(4),
    borderRadius: 16,
    marginBottom: wp(4),
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gridLabel: {
    fontSize: hp(1.7),
    color: '#9CA3AF',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: hp(2.1),
    fontWeight: '600',
    color: '#1F2937',
  },

  // Detail List
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: wp(5),
    marginBottom: hp(3),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.2),
  },
  rowLabel: {
    fontSize: hp(1.9),
    color: '#4B5563',
    flex: 1,
  },
  rowValue: {
    fontSize: hp(1.9),
    fontWeight: '600',
    color: '#111',
    textAlign: 'right',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // Recommendations
  recCard: {
    backgroundColor: '#EFF6FF', // Light Blue bg
    borderRadius: 20,
    padding: wp(5),
    marginBottom: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  recText: {
    fontSize: hp(2),
    color: '#1E3A8A',
    lineHeight: hp(3),
  },

  // Bottom Bar
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: hp(1.6),
    marginRight: 12,
  },
  outlineBtnText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: hp(2),
    marginLeft: 8,
  },
  filledBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: hp(1.6),
  },
  filledBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: hp(2),
    marginLeft: 8,
  },
});