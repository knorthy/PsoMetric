import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAssessment } from '../../components/AssessmentContext';
import { useAuth } from '../../components/AuthContext';
import AvatarBottomSheet from '../../components/AvatarBottomSheet';
import History from '../../components/history';
import { hp } from '../../helpers/common';
import { fetchAssessmentHistory, fetchAssessmentResult } from '../../services/api';
import styles from '../../styles/assessStyles';

export default function SymptomAssessmentScreen() {
  const { assessment, updateAssessment, resetAssessment } = useAssessment();
  const router = useRouter();
  const { avatar, user, session } = useAuth();
  const hasResetRef = useRef(false);

  // Format name for greeting (capitalize first letter)
  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const [historyVisible, setHistoryVisible] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const snapPoints = ["25%"];

  const HISTORY_SIDEBAR_WIDTH = 290;

  // Reset assessment data when screen first mounts (start fresh)
  useEffect(() => {
    if (!hasResetRef.current) {
      resetAssessment();
      hasResetRef.current = true;
    }
  }, []);

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
            annotated_image_url: fullResult.annotated_image_url,
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

  // Close bottom sheet when navigating away (cleanup)
  useEffect(() => {
    return () => {
      if (sheetRef.current) {
        sheetRef.current?.dismiss();
      }
    };
  }, []);

  // === State from Screen 1 ===
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [psoriasisHistory, setPsoriasisHistory] = useState('');
  const [location, setLocation] = useState([]);
  const [appearance, setAppearance] = useState([]);
  const [size, setSize] = useState([]);

  // === State from Screen 2 (shortened) ===
  const [itching, setItching] = useState(0);
  const [pain, setPain] = useState(0);

  // === State from Screen 3 (shortened) ===
  const [dailyImpact, setDailyImpact] = useState('');
  const [jointPain, setJointPain] = useState('');
  const [jointsAffected, setJointsAffected] = useState([]);
  const [currentTreatment, setCurrentTreatment] = useState('');

  // Sync local state with context (handles both loading saved data and resetting after assessment)
  useEffect(() => {
    setGender(assessment.gender || '');
    setAge(assessment.age || '');
    setPsoriasisHistory(assessment.psoriasisHistory || '');
    setLocation(assessment.location || []);
    setAppearance(assessment.appearance || []);
    setSize(assessment.size || []);
    setItching(assessment.itching || 0);
    setPain(assessment.pain || 0);
    setDailyImpact(assessment.dailyImpact || '');
    setJointPain(assessment.jointPain || '');
    setJointsAffected(assessment.jointsAffected || []);
    setCurrentTreatment(assessment.currentTreatment || '');
  }, [assessment]);

  const toggle = (array, setArray, value) => {
    setArray(array.includes(value) ? array.filter(v => v !== value) : [...array, value]);
  };

  const MultiSelect = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.checkbox, selected && styles.checkboxSelected]}
      onPress={onPress}
    >
      <View style={styles.checkboxBox}>
        {selected && <View style={styles.checkboxCheck} />}
      </View>
      <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const Radio = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.radio, selected && styles.radioSelected]}
      onPress={onPress}
    >
      <View style={styles.radioCircle}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.topBar}>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => setHistoryVisible(true)}>
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

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            onTouchStart={() => {
              if (isOpen) {
                sheetRef.current?.dismiss();
                setisOpen(false);
              }
              if (historyVisible) setHistoryVisible(false);
            }}
          >
            <Text style={styles.greeting}>Hello, {formatName(session?.name || user?.username)}! Let's assess your psoriasis.</Text>

            {/* Demographics */}
            <Text style={styles.sectionTitle}>About You</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.row}>
                {['Female', 'Male'].map(g => (
                  <Radio key={g} label={g} value={g} selected={gender === g} onPress={() => setGender(g)} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your age"
                keyboardType="numeric"
                value={age}
                onChangeText={t => setAge(t.replace(/[^0-9]/g, ''))}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>History of Psoriasis</Text>
              <View style={styles.radioGroup}>
                <Radio label="First time onset" value="first" selected={psoriasisHistory === 'first'} onPress={() => setPsoriasisHistory('first')} />
                <Radio label="Recurrent" value="recurrent" selected={psoriasisHistory === 'recurrent'} onPress={() => setPsoriasisHistory('recurrent')} />
              </View>
            </View>

            {/* Symptoms */}
            <Text style={styles.sectionTitle}>Symptoms</Text>

            <View style={styles.section}>
              <Text style={styles.question}>Location (select all that apply)</Text>
              <View style={styles.checkboxGroup}>
                {['Scalp', 'Elbows', 'Knees', 'Nails', 'Genitals', 'Palms/Soles'].map((l, i) => {
                  const value = ['scalp', 'elbows', 'knees', 'nails', 'genitals', 'palmsSoles'][i];
                  return <MultiSelect key={value} label={l} value={value} selected={location.includes(value)} onPress={() => toggle(location, setLocation, value)} />;
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.question}>Appearance (select all that apply)</Text>
              <View style={styles.checkboxGroup}>
                {['Red', 'Scaly', 'Silvery-white', 'Cracked', 'Bleeding', 'Pustular'].map((a, i) => {
                  const value = ['red', 'scaly', 'silvery', 'cracked', 'bleeding', 'pustular'][i];
                  return <MultiSelect key={value} label={a} value={value} selected={appearance.includes(value)} onPress={() => toggle(appearance, setAppearance, value)} />;
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.question}>Size of affected areas</Text>
              <View style={styles.checkboxGroup}>
                {['Coin-sized', 'Palm-sized', 'Widespread'].map((s, i) => {
                  const value = ['coin', 'palm', 'widespread'][i];
                  return <MultiSelect key={value} label={s} value={value} selected={size.includes(value)} onPress={() => toggle(size, setSize, value)} />;
                })}
              </View>
            </View>

            {/* Severity */}
            <Text style={styles.sectionTitle}>Severity</Text>
            <View style={styles.section}>
              <Text style={styles.question}>Rate your symptoms (0–10)</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Itching</Text>
                  <Text style={styles.sliderValue}>{itching}</Text>
                </View>
                <Slider minimumValue={0} maximumValue={10} step={1} value={itching} onValueChange={setItching} minimumTrackTintColor="#007AFF" thumbTintColor="#007AFF" />

                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Pain</Text>
                  <Text style={styles.sliderValue}>{pain}</Text>
                </View>
                <Slider minimumValue={0} maximumValue={10} step={1} value={pain} onValueChange={setPain} minimumTrackTintColor="#007AFF" thumbTintColor="#007AFF" />
              </View>
            </View>

            {/* Joints & Impact */}
            <Text style={styles.sectionTitle}>Additional Symptoms</Text>
            <View style={styles.section}>
              <Text style={styles.question}>Any joint pain, stiffness, or swelling?</Text>
              <View style={styles.radioGroup}>
                <Radio label="No" value="no" selected={jointPain === 'no'} onPress={() => setJointPain('no')} />
                <Radio label="Yes" value="yes" selected={jointPain === 'yes'} onPress={() => setJointPain('yes')} />
              </View>
              {jointPain === 'yes' && (
                <View style={styles.checkboxGroup}>
                  {['Fingers', 'Toes', 'Lower back', 'Knees', 'Wrists'].map((j, i) => {
                    const value = ['fingers', 'toes', 'back', 'knees', 'wrists'][i];
                    return <MultiSelect key={value} label={j} value={value} selected={jointsAffected.includes(value)} onPress={() => toggle(jointsAffected, setJointsAffected, value)} />;
                  })}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.question}>How much does psoriasis affect daily activities?</Text>
              <View style={styles.radioGroup}>
                {['Not at all', 'Mildly', 'Moderately', 'Severely'].map((level, i) => {
                  const value = ['none', 'mild', 'moderate', 'severe'][i];
                  return <Radio key={value} label={level} value={value} selected={dailyImpact === value} onPress={() => setDailyImpact(value)} />;
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.question}>Current treatment (if any)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., topical steroid, none"
                value={currentTreatment}
                onChangeText={setCurrentTreatment}
              />
            </View>

            <View style={{ height: hp(10) }} />
          </ScrollView>

          {/* FAB */}
          {!isOpen && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                updateAssessment({ gender, age, psoriasisHistory, location, appearance, size, itching, pain, dailyImpact, jointPain, jointsAffected, currentTreatment });
                router.push('/photoguide');
              }}
            >
              <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <History visible={historyVisible} onClose={() => setHistoryVisible(false)} onSelectAssessment={handleSelectAssessment} assessments={assessments} />

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
              <AvatarBottomSheet onPick={() => sheetRef.current?.dismiss()} onClose={() => sheetRef.current?.dismiss()} />
            </BottomSheetView>
          </BottomSheetModal>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}