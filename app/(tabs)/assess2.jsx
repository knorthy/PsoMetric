import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from '@react-native-community/slider';
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

export default function Assess2Screen() {
  const { screen2, updateScreen2 } = useAssessment();
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

  // Close bottom sheet when navigating away
  useEffect(() => {
    return () => {
      if (sheetRef.current) {
        sheetRef.current?.dismiss();
      }
    };
  }, []);

  const [onsetDate, setOnsetDate] = useState('');
  const [symptomPattern, setSymptomPattern] = useState('');
  const [lesionSpeed, setLesionSpeed] = useState('');

  const [itching, setItching] = useState(0);
  const [burning, setBurning] = useState(0);
  const [pain, setPain] = useState(0);
  const [bleeding, setBleeding] = useState(0);
  const [worsenAtNight, setWorsenAtNight] = useState('');
  const [worsenWithStress, setWorsenWithStress] = useState('');

  const [triggers, setTriggers] = useState([]);
  const [medTriggers, setMedTriggers] = useState([]);
  const [sunlightEffect, setSunlightEffect] = useState('');

  // Load saved data from context on mount
  useEffect(() => {
    if (screen2.onsetDate) setOnsetDate(screen2.onsetDate);
    if (screen2.symptomPattern) setSymptomPattern(screen2.symptomPattern);
    if (screen2.lesionSpeed) setLesionSpeed(screen2.lesionSpeed);
    if (screen2.itching !== undefined) setItching(screen2.itching);
    if (screen2.burning !== undefined) setBurning(screen2.burning);
    if (screen2.pain !== undefined) setPain(screen2.pain);
    if (screen2.bleeding !== undefined) setBleeding(screen2.bleeding);
    if (screen2.worsenAtNight) setWorsenAtNight(screen2.worsenAtNight);
    if (screen2.worsenWithStress) setWorsenWithStress(screen2.worsenWithStress);
    if (screen2.triggers.length > 0) setTriggers(screen2.triggers);
    if (screen2.medTriggers.length > 0) setMedTriggers(screen2.medTriggers);
    if (screen2.sunlightEffect) setSunlightEffect(screen2.sunlightEffect);
  }, []);

  // Toggle multi-select
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


  const SliderRow = ({ label, value }) => (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <Text style={styles.sliderValue}>{value}</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.topBar}>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setHistoryVisible(true)}
            >
              
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
          Let's understand your symptoms better
        </Text>

        {/* ONSET & DURATION */}
        <SectionTitle>Onset & Duration</SectionTitle>

        <View style={styles.section}>
          <Question>When did you first notice symptoms?</Question>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 2 weeks ago, Jan 2025"
            value={onsetDate}
            onChangeText={setOnsetDate}
          />
        </View>

        <View style={styles.section}>
          <Question>Have symptoms been continuous or come and go?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Continuous"
              value="continuous"
              selected={symptomPattern === 'continuous'}
              onPress={() => setSymptomPattern('continuous')}
            />
            <RadioOption
              label="Come and go"
              value="intermittent"
              selected={symptomPattern === 'intermittent'}
              onPress={() => setSymptomPattern('intermittent')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Question>How quickly did new lesions appear?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Gradually (over weeks)"
              value="gradual"
              selected={lesionSpeed === 'gradual'}
              onPress={() => setLesionSpeed('gradual')}
            />
            <RadioOption
              label="Rapidly (within days)"
              value="rapid"
              selected={lesionSpeed === 'rapid'}
              onPress={() => setLesionSpeed('rapid')}
            />
          </View>
        </View>

        {/* SEVERITY & SYMPTOMS */}
        <SectionTitle>Severity & Symptoms</SectionTitle>

        <View style={styles.section}>
          <Question>On a scale of 0–10, how severe is the:</Question>

          <View style={styles.sliderContainer}>
            <SliderRow label="Itching" value={itching} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={itching}
              onValueChange={setItching}
              minimumTrackTintColor="#007AFF"
              thumbTintColor="#007AFF"
            />

            <SliderRow label="Burning/stinging" value={burning} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={burning}
              onValueChange={setBurning}
              minimumTrackTintColor="#007AFF"
              thumbTintColor="#007AFF"
            />

            <SliderRow label="Pain" value={pain} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={pain}
              onValueChange={setPain}
              minimumTrackTintColor="#007AFF"
              thumbTintColor="#007AFF"
            />

            <SliderRow label="Bleeding/cracking" value={bleeding} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={bleeding}
              onValueChange={setBleeding}
              minimumTrackTintColor="#007AFF"
              thumbTintColor="#007AFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Question>Do symptoms worsen at night?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Yes"
              value="yes"
              selected={worsenAtNight === 'yes'}
              onPress={() => setWorsenAtNight('yes')}
            />
            <RadioOption
              label="No"
              value="no"
              selected={worsenAtNight === 'no'}
              onPress={() => setWorsenAtNight('no')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Question>Do symptoms worsen with stress?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Yes"
              value="yes"
              selected={worsenWithStress === 'yes'}
              onPress={() => setWorsenWithStress('yes')}
            />
            <RadioOption
              label="No"
              value="no"
              selected={worsenWithStress === 'no'}
              onPress={() => setWorsenWithStress('no')}
            />
          </View>
        </View>

        {/* TRIGGERS & AGGRAVATORS */}
        <SectionTitle>Triggers & Aggravators</SectionTitle>

        <View style={styles.section}>
          <Question>Any recent triggers?</Question>
          <View style={styles.chipGroup}>
            {[
              { label: 'Stress', value: 'stress' },
              { label: 'Infection', value: 'infection' },
              { label: 'Skin injury', value: 'injury' },
              { label: 'Cold weather', value: 'cold' },
              { label: 'Alcohol', value: 'alcohol' },
              { label: 'Smoking', value: 'smoking' },
            ].map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                value={item.value}
                selected={triggers.includes(item.value)}
                onPress={() => toggle(triggers, setTriggers, item.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Question>
            Do certain foods, medications, or infections worsen it?
          </Question>
          <View style={styles.chipGroup}>
            {[
              { label: 'Beta-blockers', value: 'beta' },
              { label: 'Lithium', value: 'lithium' },
              { label: 'Antimalarials', value: 'antimalarial' },
              { label: 'Strep throat', value: 'strep' },
              { label: 'Certain foods', value: 'foods' },
            ].map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                value={item.value}
                selected={medTriggers.includes(item.value)}
                onPress={() => toggle(medTriggers, setMedTriggers, item.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Question>Any improvement with sunlight or worsening in winter?</Question>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Improves with sunlight"
              value="sunlight"
              selected={sunlightEffect === 'sunlight'}
              onPress={() => setSunlightEffect('sunlight')}
            />
            <RadioOption
              label="Worsens in winter"
              value="winter"
              selected={sunlightEffect === 'winter'}
              onPress={() => setSunlightEffect('winter')}
            />
            <RadioOption
              label="No change"
              value="none"
              selected={sunlightEffect === 'none'}
              onPress={() => setSunlightEffect('none')}
            />
          </View>
        </View>
      </ScrollView>

      {/* FAB - Bottom Right */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            // Save screen 2 data to context before navigating
            updateScreen2({
              onsetDate,
              symptomPattern,
              lesionSpeed,
              itching,
              burning,
              pain,
              bleeding,
              worsenAtNight,
              worsenWithStress,
              triggers,
              medTriggers,
              sunlightEffect,
            });
            router.push('/assess3');
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

  content: { 
    flex: 1, 
    paddingHorizontal: wp(6), 
    paddingTop: hp(2) 
  },

  greeting: {
    fontSize: hp(3),
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: hp(1),
    lineHeight: hp(3.8),
  },

  sectionTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(2),
    marginTop: hp(3),
  },

  section: { marginBottom: hp(3) },
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
    fontSize: hp(1.5),
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

  sliderContainer: { 
    gap: hp(2.5) 
  },

  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sliderLabel: { 
    fontSize: hp(1.8), 
    color: '#333' 
  },

  sliderValue: { 
    fontSize: hp(1.8), 
    fontWeight: '600', 
    color: '#007AFF' 
  },

  slider: { 
    height: 40 
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
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    zIndex: 1000,
  },
});