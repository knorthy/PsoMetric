import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAssessment } from '../../components/AssessmentContext';
import AvatarBottomSheet from '../../components/AvatarBottomSheet';
import History from '../../components/history';
import { hp, wp } from '../../helpers/common';

export default function Assess3Screen() {
  const { screen3, updateScreen3 } = useAssessment();
  const router = useRouter();

  const [historyVisible, setHistoryVisible] = useState(false);

  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const snapPoints = ["25%"];

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  const handleSelectAssessment = (assessment) => {
  console.log('Selected assessment:', assessment);
  setHistoryVisible(false); 

  };

  const [dailyImpact, setDailyImpact] = useState('');
  const [emotionalImpact, setEmotionalImpact] = useState('');
  const [relationshipsImpact, setRelationshipsImpact] = useState('');

  const [jointPain, setJointPain] = useState('');
  const [jointsAffected, setJointsAffected] = useState([]);
  const [nailWithJoint, setNailWithJoint] = useState('');

  const [pastTreatments, setPastTreatments] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [otherConditions, setOtherConditions] = useState([]);

  const [currentTreatment, setCurrentTreatment] = useState('');
  const [reliefSideEffects, setReliefSideEffects] = useState('');
  const [triedSystemic, setTriedSystemic] = useState('');

  const [feverInfection, setFeverInfection] = useState('');
  const [weightLossFatigue, setWeightLossFatigue] = useState('');

  // Load saved data from context on mount
  useEffect(() => {
    if (screen3.dailyImpact) setDailyImpact(screen3.dailyImpact);
    if (screen3.emotionalImpact) setEmotionalImpact(screen3.emotionalImpact);
    if (screen3.relationshipsImpact) setRelationshipsImpact(screen3.relationshipsImpact);
    if (screen3.jointPain) setJointPain(screen3.jointPain);
    if (screen3.jointsAffected.length > 0) setJointsAffected(screen3.jointsAffected);
    if (screen3.nailWithJoint) setNailWithJoint(screen3.nailWithJoint);
    if (screen3.pastTreatments) setPastTreatments(screen3.pastTreatments);
    if (screen3.familyHistory.length > 0) setFamilyHistory(screen3.familyHistory);
    if (screen3.otherConditions.length > 0) setOtherConditions(screen3.otherConditions);
    if (screen3.currentTreatment) setCurrentTreatment(screen3.currentTreatment);
    if (screen3.reliefSideEffects) setReliefSideEffects(screen3.reliefSideEffects);
    if (screen3.triedSystemic) setTriedSystemic(screen3.triedSystemic);
    if (screen3.feverInfection) setFeverInfection(screen3.feverInfection);
    if (screen3.weightLossFatigue) setWeightLossFatigue(screen3.weightLossFatigue);
  }, []);

  const toggle = (array, setArray, value) => {
    setArray(
      array.includes(value)
        ? array.filter((v) => v !== value)
        : [...array, value]
    );
  };

  const SectionTitle = ({ children }) => (
    <Text style={styles.sectionTitle}>{children}</Text>
  );

  const Question = ({ children }) => (
    <Text style={styles.questionText}>{children}</Text>
  );

  const RadioOption = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.radioOption, selected && styles.radioOptionSelected]}
      onPress={onPress}
    >
      <View style={styles.radioCircle}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const Chip = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.topBar}>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setHistoryVisible(true)}>
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          <Image
            source={require('../../assets/images/avatar.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(12) }}
      >
        {/* GREETING */}
        <Text style={styles.greeting}>
          We're almost done — just a few more details
        </Text>

        {/* IMPACT ON QUALITY OF LIFE */}
        <SectionTitle>Impact on Quality of Life</SectionTitle>

        <View style={styles.section}>
          <Question>How much does psoriasis affect your daily activities?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Not at all"
              value="none"
              selected={dailyImpact === 'none'}
              onPress={() => setDailyImpact('none')}
            />
            <RadioOption
              label="Mildly"
              value="mild"
              selected={dailyImpact === 'mild'}
              onPress={() => setDailyImpact('mild')}
            />
            <RadioOption
              label="Moderately"
              value="moderate"
              selected={dailyImpact === 'moderate'}
              onPress={() => setDailyImpact('moderate')}
            />
            <RadioOption
              label="Severely"
              value="severe"
              selected={dailyImpact === 'severe'}
              onPress={() => setDailyImpact('severe')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Question>Any embarrassment, anxiety, or depression?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="No"
              value="no"
              selected={emotionalImpact === 'no'}
              onPress={() => setEmotionalImpact('no')}
            />
            <RadioOption
              label="Sometimes"
              value="sometimes"
              selected={emotionalImpact === 'sometimes'}
              onPress={() => setEmotionalImpact('sometimes')}
            />
            <RadioOption
              label="Often"
              value="often"
              selected={emotionalImpact === 'often'}
              onPress={() => setEmotionalImpact('often')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Question>Impact on intimate relationships?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="No impact"
              value="none"
              selected={relationshipsImpact === 'none'}
              onPress={() => setRelationshipsImpact('none')}
            />
            <RadioOption
              label="Some impact"
              value="some"
              selected={relationshipsImpact === 'some'}
              onPress={() => setRelationshipsImpact('some')}
            />
            <RadioOption
              label="Significant"
              value="significant"
              selected={relationshipsImpact === 'significant'}
              onPress={() => setRelationshipsImpact('significant')}
            />
          </View>
        </View>

        {/* JOINT SYMPTOMS */}
        <SectionTitle>Joint Symptoms</SectionTitle>

        <View style={styles.section}>
          <Question>Any joint pain, stiffness, or swelling?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="No"
              value="no"
              selected={jointPain === 'no'}
              onPress={() => setJointPain('no')}
            />
            <RadioOption
              label="Yes"
              value="yes"
              selected={jointPain === 'yes'}
              onPress={() => setJointPain('yes')}
            />
          </View>
        </View>

        {jointPain === 'yes' && (
          <>
            <View style={styles.section}>
              <Question>Which joints?</Question>
              <View style={styles.chipGroup}>
                {[
                  { label: 'Fingers', value: 'fingers' },
                  { label: 'Toes', value: 'toes' },
                  { label: 'Lower back', value: 'back' },
                  { label: 'Knees', value: 'knees' },
                  { label: 'Wrists', value: 'wrists' },
                ].map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    selected={jointsAffected.includes(item.value)}
                    onPress={() => toggle(jointsAffected, setJointsAffected, item.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Question>Any nail changes with joint pain?</Question>
              <View style={styles.radioGroup}>
                <RadioOption
                  label="Yes"
                  value="yes"
                  selected={nailWithJoint === 'yes'}
                  onPress={() => setNailWithJoint('yes')}
                />
                <RadioOption
                  label="No"
                  value="no"
                  selected={nailWithJoint === 'no'}
                  onPress={() => setNailWithJoint('no')}
                />
              </View>
            </View>
          </>
        )}

        {/* PAST MEDICAL & FAMILY HISTORY */}
        <SectionTitle>Past Medical & Family History</SectionTitle>

        <View style={styles.section}>
          <Question>Previous treatments?</Question>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., topicals, phototherapy, biologics"
            value={pastTreatments}
            onChangeText={setPastTreatments}
          />
        </View>

        <View style={styles.section}>
          <Question>Family history of psoriasis or autoimmune diseases?</Question>
          <View style={styles.chipGroup}>
            {[
              { label: 'Psoriasis', value: 'psoriasis' },
              { label: 'Rheumatoid arthritis', value: 'ra' },
              { label: 'Crohn’s/IBD', value: 'ibd' },
              { label: 'Lupus', value: 'lupus' },
              { label: 'None', value: 'none' },
            ].map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                value={item.value}
                selected={familyHistory.includes(item.value)}
                onPress={() => toggle(familyHistory, setFamilyHistory, item.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Question>Other conditions?</Question>
          <View style={styles.chipGroup}>
            {[
              { label: 'Obesity', value: 'obesity' },
              { label: 'Diabetes', value: 'diabetes' },
              { label: 'Hypertension', value: 'htn' },
              { label: 'Depression', value: 'depression' },
              { label: 'IBD', value: 'ibd' },
            ].map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                value={item.value}
                selected={otherConditions.includes(item.value)}
                onPress={() => toggle(otherConditions, setOtherConditions, item.value)}
              />
            ))}
          </View>
        </View>

        {/* CURRENT TREATMENTS */}
        <SectionTitle>Current Treatments & Response</SectionTitle>

        <View style={styles.section}>
          <Question>What are you using now?</Question>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., steroid cream, vitamin D"
            value={currentTreatment}
            onChangeText={setCurrentTreatment}
          />
        </View>

        <View style={styles.section}>
          <Question>Any relief or side effects?</Question>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., helps itching, skin thinning"
            value={reliefSideEffects}
            onChangeText={setReliefSideEffects}
          />
        </View>

        <View style={styles.section}>
          <Question>Ever tried systemic meds or biologics?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="No"
              value="no"
              selected={triedSystemic === 'no'}
              onPress={() => setTriedSystemic('no')}
            />
            <RadioOption
              label="Yes"
              value="yes"
              selected={triedSystemic === 'yes'}
              onPress={() => setTriedSystemic('yes')}
            />
          </View>
        </View>

        {/* ASSOCIATED SYMPTOMS */}
        <SectionTitle>Associated Symptoms</SectionTitle>

        <View style={styles.section}>
          <Question>Any fever, chills, or recent infections?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="No"
              value="no"
              selected={feverInfection === 'no'}
              onPress={() => setFeverInfection('no')}
            />
            <RadioOption
              label="Yes"
              value="yes"
              selected={feverInfection === 'yes'}
              onPress={() => setFeverInfection('yes')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Question>Weight loss or fatigue?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="No"
              value="no"
              selected={weightLossFatigue === 'no'}
              onPress={() => setWeightLossFatigue('no')}
            />
            <RadioOption
              label="Yes"
              value="yes"
              selected={weightLossFatigue === 'yes'}
              onPress={() => setWeightLossFatigue('yes')}
            />
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            // Save screen 3 data to context before navigating
            updateScreen3({
              dailyImpact,
              emotionalImpact,
              relationshipsImpact,
              jointPain,
              jointsAffected,
              nailWithJoint,
              pastTreatments,
              familyHistory,
              otherConditions,
              currentTreatment,
              reliefSideEffects,
              triedSystemic,
              feverInfection,
              weightLossFatigue,
            });
            router.push('/camera-welcome'); 
          }}
        >
          <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <History
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onSelectAssessment={handleSelectAssessment}
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

  avatar: { 
    width: '100%',
    height: '100%' 
    },

  content: { 
    flex: 1, 
    paddingHorizontal: wp(6), 
    paddingTop: hp(2) 
  },

  greeting: {
    fontSize: hp(3),
    fontWeight: '600',
    color: '#007AFF',
    lineHeight: hp(3.8),
  },

  sectionTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(2),
    marginTop: hp(3),
  },

  section: { 
    marginBottom: hp(3) 
  },

  questionText: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(1.5),
    lineHeight: hp(2.8),
  },

  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    fontSize: hp(1.8),
  },

  radioGroup: { gap: hp(1.2) },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },

  radioOptionSelected: {
    backgroundColor: '#E5F1FF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },

  radioLabel: { 
    fontSize: hp(1.5), 
    color: '#666' 
  },

  radioLabelSelected: { 
    color: '#007AFF', 
    fontWeight: '500' 
  },

  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginTop: hp(1),
  },

  chip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  chipSelected: {
    backgroundColor: '#E5F1FF',
    borderColor: '#007AFF',
  },

  chipText: { 
    fontSize: hp(1.6), 
    color: '#666' 
  },

  chipTextSelected: { 
    color: '#007AFF', 
    fontWeight: '500' 
  },

  fab: {
    position: 'absolute',
    right: wp(6),
    bottom: hp(4),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    zIndex: 1000,
  },
});