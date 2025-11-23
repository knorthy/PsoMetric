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

  const pasiScore = 12.4;

  const fmt = (val, fallback = 'Not specified') =>
    val && val !== '' ? (Array.isArray(val) ? val.join(', ') : val) : fallback;

  const fmtYesNo = (val) => (val === 'yes' ? 'Yes' : val === 'no' ? 'No' : 'Not specified');

  const fmtList = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : 'None');

  // Extract all params
  const {
    gender, age, psoriasisHistory,
    location, appearance, size, nails, scalp,
    onsetDate, symptomPattern, lesionSpeed,
    itching, burning, pain, bleeding,
    worsenAtNight, worsenWithStress, triggers, medTriggers, sunlightEffect,
    dailyImpact, emotionalImpact, relationshipsImpact,
    jointPain, jointsAffected, nailWithJoint,
    pastTreatments, familyHistory, otherConditions,
    currentTreatment, reliefSideEffects, triedSystemic,
    feverInfection, weightLossFatigue, images,
  } = params;

  // Translate values
  const dailyImpactText = {
    none: 'None', mild: 'Mild', moderate: 'Moderate', severe: 'Severe'
  }[dailyImpact] || 'Not specified';

  const historyText = psoriasisHistory === 'first' ? 'First onset' : 
                      psoriasisHistory === 'recurrent' ? 'Recurrent' : 'Not specified';

  const severity = (score) => {
    if (score < 10) return { text: 'Mild', color: '#34C759' };
    if (score < 20) return { text: 'Moderate', color: '#FF9F0A' };
    return { text: 'Severe', color: '#FF3B30' };
  };
  const { text: severityText, color: severityColor } = severity(pasiScore);

  const uploadedImages = images ? (Array.isArray(images) ? images : [images]) : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

    {/* Top Bar */}
<View style={styles.topBar}>
  <TouchableOpacity hitSlop={20}>
    <Ionicons name="menu" size={30} color="#333" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.avatarContainer}>
    <Image source={require('../../assets/images/avatar.jpg')} style={styles.avatar} />
  </TouchableOpacity>
</View>

      <Text style={styles.pageTitle}>PASI Assessment Result</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Main Score Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryMainScore}>{pasiScore.toFixed(1)}</Text>
          <Text style={styles.outOf72}>out of 72</Text>
          <View style={[styles.severityPill, { backgroundColor: severityColor }]}>
            <Text style={styles.severityPillText}>{severityText} Psoriasis</Text>
          </View>
          <Text style={styles.summaryDescription}>
            Your current psoriasis is classified as <Text style={{ fontWeight: '700' }}>{severityText.toLowerCase()}</Text>.
          </Text>
        </View>

        {/* Quick Facts */}
        <View style={styles.quickFacts}>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Age</Text>
            <Text style={styles.factValue}>{fmt(age, '–')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Gender</Text>
            <Text style={styles.factValue}>{fmt(gender, '–')}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Daily Impact</Text>
            <Text style={styles.factValue}>{dailyImpactText}</Text>
          </View>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>Joint Pain</Text>
            <Text style={styles.factValue}>{fmtYesNo(jointPain) === 'Yes' ? 'Present' : 'None'}</Text>
          </View>
        </View>

        {/* Detailed Summary */}
        <Text style={styles.sectionTitle}>Detailed Symptom Summary</Text>
        <View style={styles.detailCard}>
          {/* All your existing detailed rows  */}
          <Text style={styles.subSectionTitle}>Basic Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>History of Psoriasis</Text>
            <Text style={styles.detailValue}>{historyText}</Text>
          </View>

          <Text style={styles.subSectionTitle}>Lesion Characteristics</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{fmtList(location)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Appearance</Text>
            <Text style={styles.detailValue}>{fmtList(appearance)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size of Affected Areas</Text>
            <Text style={styles.detailValue}>{fmtList(size)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nail Involvement</Text>
            <Text style={styles.detailValue}>{fmtList(nails)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scalp Symptoms</Text>
            <Text style={styles.detailValue}>{fmtList(scalp)}</Text>
          </View>

          <Text style={styles.subSectionTitle}>Onset & Pattern</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>When symptoms started</Text>
            <Text style={styles.detailValue}>{fmt(onsetDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pattern</Text>
            <Text style={styles.detailValue}>{symptomPattern === 'continuous' ? 'Continuous' : 'Come and go'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Speed of new lesions</Text>
            <Text style={styles.detailValue}>{lesionSpeed === 'rapid' ? 'Rapid (days)' : 'Gradual (weeks)'}</Text>
          </View>

          <Text style={styles.subSectionTitle}>Severity (0–10)</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Itching</Text>
            <Text style={styles.detailValue}>{fmt(itching, '–')}/10</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Burning/Stinging</Text>
            <Text style={styles.detailValue}>{fmt(burning, '–')}/10</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pain</Text>
            <Text style={styles.detailValue}>{fmt(pain, '–')}/10</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bleeding/Cracking</Text>
            <Text style={styles.detailValue}>{fmt(bleeding, '–')}/10</Text>
          </View>

          <Text style={styles.subSectionTitle}>Triggers & Aggravators</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Worsens at night</Text>
            <Text style={styles.detailValue}>{fmtYesNo(worsenAtNight)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Worsens with stress</Text>
            <Text style={styles.detailValue}>{fmtYesNo(worsenWithStress)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Known triggers</Text>
            <Text style={styles.detailValue}>{fmtList(triggers)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Medications/Infections</Text>
            <Text style={styles.detailValue}>{fmtList(medTriggers)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sunlight/Winter effect</Text>
            <Text style={styles.detailValue}>
              {sunlightEffect === 'sunlight' ? 'Improves with sun' :
               sunlightEffect === 'winter' ? 'Worsens in winter' : 'No change'}
            </Text>
          </View>

          <Text style={styles.subSectionTitle}>Quality of Life Impact</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Daily activities</Text>
            <Text style={styles.detailValue}>{dailyImpactText}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Emotional impact</Text>
            <Text style={styles.detailValue}>
              {emotionalImpact === 'often' ? 'Often' : emotionalImpact === 'sometimes' ? 'Sometimes' : 'None'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Relationships</Text>
            <Text style={styles.detailValue}>
              {relationshipsImpact === 'significant' ? 'Significant' :
               relationshipsImpact === 'some' ? 'Some impact' : 'No impact'}
            </Text>
          </View>

          {jointPain === 'yes' && (
            <>
              <Text style={styles.subSectionTitle}>Joint Symptoms (Psoriatic Arthritis Risk)</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Affected joints</Text>
                <Text style={styles.detailValue}>{fmtList(jointsAffected)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nail + joint involvement</Text>
                <Text style={styles.detailValue}>{fmtYesNo(nailWithJoint)}</Text>
              </View>
            </>
          )}

          <Text style={styles.subSectionTitle}>Medical History</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Past treatments</Text>
            <Text style={styles.detailValue}>{fmt(pastTreatments)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Family history</Text>
            <Text style={styles.detailValue}>{fmtList(familyHistory)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Other conditions</Text>
            <Text style={styles.detailValue}>{fmtList(otherConditions)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current treatment</Text>
            <Text style={styles.detailValue}>{fmt(currentTreatment)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Response & side effects</Text>
            <Text style={styles.detailValue}>{fmt(reliefSideEffects)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tried systemic/biologics</Text>
            <Text style={styles.detailValue}>{fmtYesNo(triedSystemic)}</Text>
          </View>

          <Text style={styles.subSectionTitle}>Associated Symptoms</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fever or infection</Text>
            <Text style={styles.detailValue}>{fmtYesNo(feverInfection)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight loss / Fatigue</Text>
            <Text style={styles.detailValue}>{fmtYesNo(weightLossFatigue)}</Text>
          </View>
        </View>

        {/* Uploaded Photos */}
        <Text style={styles.sectionTitle}>Your Uploaded Photos</Text>
        {uploadedImages.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {uploadedImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} resizeMode="cover" />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageLabel}>Photo {index + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImagesCard}>
            <Ionicons name="camera-outline" size={40} color="#ccc" />
            <Text style={styles.noImagesText}>No photos were uploaded</Text>
          </View>
        )}

        {/* Personalized Recommendations */}
        <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
        <View style={styles.recommendationsCard}>
          {pasiScore < 10 && (
            <>
              <Text style={styles.recItem}>• Continue with topical treatments (steroids, vitamin D analogs)</Text>
              <Text style={styles.recItem}>• Daily moisturizing is key</Text>
              <Text style={styles.recItem}>• Sun exposure can help — use sunscreen</Text>
            </>
          )}
          {pasiScore >= 10 && pasiScore < 20 && (
            <>
              <Text style={styles.recItem}>• Phototherapy (NB-UVB) is highly effective</Text>
              <Text style={styles.recItem}>• Consider oral options: methotrexate, acitretin, apremilast</Text>
              <Text style={styles.recItem}>• Biologics (IL-17/IL-23 inhibitors) are excellent next step</Text>
            </>
          )}
          {pasiScore >= 20 && (
            <>
              <Text style={styles.recItem}>• Biologic therapy strongly recommended</Text>
              <Text style={styles.recItem}>• Best options: secukinumab, ixekizumab, guselkumab, risankizumab</Text>
              <Text style={styles.recItem}>• Urgent screening for psoriatic arthritis & cardiovascular risk</Text>
            </>
          )}
          <View style={styles.alwaysRec}>
            <Text style={styles.recItem}>• Avoid known triggers: {fmtList(triggers).toLowerCase() || 'stress, alcohol, smoking'}</Text>
            <Text style={styles.recItem}>• Maintain healthy weight and regular exercise</Text>
            <Text style={styles.recItem}>• You're not alone — support groups can help</Text>
          </View>
        </View>

        <View style={{ height: hp(14) }} />
      </ScrollView>

      {/* Bottom Buttons */}
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

      {/*  */}
    </SafeAreaView>
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
    marginMarginBottom: hp(3) 
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
  recItem: { 
    fontSize: hp(2.2), 
    color: '#333', 
    lineHeight: hp(3.4), 
    marginBottom: hp(1) 
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