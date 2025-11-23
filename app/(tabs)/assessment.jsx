import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { hp, wp } from '../../helpers/common';

export default function SymptomAssessmentScreen() {
  // Existing state
  const [gender, setGender] = useState('');
  const [psoriasisHistory, setPsoriasisHistory] = useState('');
  const [age, setAge] = useState('');

  const router = useRouter();

  // New multi-select states
  const [location, setLocation] = useState([]);
  const [appearance, setAppearance] = useState([]);
  const [size, setSize] = useState([]);
  const [nails, setNails] = useState([]);
  const [scalp, setScalp] = useState([]);

  const toggleOption = (array, setArray, value) => {
    if (array.includes(value)) {
      setArray(array.filter((v) => v !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const MultiSelectOption = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.checkboxOption,
        selected && styles.checkboxOptionSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.checkboxBox}>
        {selected && <View style={styles.checkboxCheck} />}
      </View>
      <Text
        style={[
          styles.checkboxLabel,
          selected && styles.checkboxLabelSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Helper component for Question + Note
  const QuestionWithNote = ({ question, note }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question}</Text>
      {note && <Text style={styles.noteText}>Note: {note}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            source={require('../../assets/images/avatar.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>
          Hello Jasmine, how are you feeling today?
        </Text>

        <Text style={styles.sectionTitle}>Symptom Assessment</Text>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Female', 'Male'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioOption,
                  gender === option && styles.radioOptionSelected,
                ]}
                onPress={() => setGender(option)}
              >
                <View style={styles.radioCircle}>
                  {gender === option && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    gender === option && styles.radioLabelSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age */}
        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your age"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.label}>History of Psoriasis</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'first', label: "It's the first time onset" },
              { value: 'recurrent', label: "This isn't the first time I've experienced this" },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.radioOption,
                  psoriasisHistory === item.value && styles.radioOptionSelected,
                ]}
                onPress={() => setPsoriasisHistory(item.value)}
              >
                <View style={styles.radioCircle}>
                  {psoriasisHistory === item.value && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    psoriasisHistory === item.value && styles.radioLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SYMPTOM DESCRIPTION SECTION */}
        <Text style={[styles.sectionTitle, { marginTop: hp(4) }]}>
          Symptom Description
        </Text>

        {/* 1. Location */}
        <View style={styles.section}>
          <QuestionWithNote
            question="Where on your body are the plaques/lesions located?"
            note="select all that apply"
          />
          <View style={styles.checkboxGroup}>
            {[
              { value: 'scalp', label: 'Scalp' },
              { value: 'elbows', label: 'Elbows' },
              { value: 'knees', label: 'Knees' },
              { value: 'nails', label: 'Nails' },
              { value: 'genitals', label: 'Genitals' },
              { value: 'palmsSoles', label: 'Palms/Soles' },
            ].map((item) => (
              <MultiSelectOption
                key={item.value}
                label={item.label}
                value={item.value}
                selected={location.includes(item.value)}
                onPress={() => toggleOption(location, setLocation, item.value)}
              />
            ))}
          </View>
        </View>

        {/* 2. Appearance */}
        <View style={styles.section}>
          <QuestionWithNote
            question="What do the lesions look like?"
            note="select all that apply"
          />
          <View style={styles.checkboxGroup}>
            {[
              { value: 'red', label: 'Red' },
              { value: 'scaly', label: 'Scaly' },
              { value: 'silvery', label: 'Silvery-white' },
              { value: 'cracked', label: 'Cracked' },
              { value: 'bleeding', label: 'Bleeding' },
              { value: 'pustular', label: 'Pustular' },
            ].map((item) => (
              <MultiSelectOption
                key={item.value}
                label={item.label}
                value={item.value}
                selected={appearance.includes(item.value)}
                onPress={() => toggleOption(appearance, setAppearance, item.value)}
              />
            ))}
          </View>
        </View>

        {/* 3. Size */}
        <View style={styles.section}>
          <QuestionWithNote question="How large are the affected areas?" />
          <View style={styles.checkboxGroup}>
            {[
              { value: 'coin', label: 'Coin-sized' },
              { value: 'palm', label: 'Palm-sized' },
              { value: 'widespread', label: 'Widespread' },
            ].map((item) => (
              <MultiSelectOption
                key={item.value}
                label={item.label}
                value={item.value}
                selected={size.includes(item.value)}
                onPress={() => toggleOption(size, setSize, item.value)}
              />
            ))}
          </View>
        </View>

        {/* 4. Nails */}
        <View style={styles.section}>
          <QuestionWithNote
            question="Are your nails affected?"
            note="select all that apply"
          />
          <View style={styles.checkboxGroup}>
            {[
              { value: 'pitting', label: 'Pitting' },
              { value: 'ridges', label: 'Ridges' },
              { value: 'discoloration', label: 'Discoloration' },
              { value: 'separation', label: 'Separation from nail bed' },
            ].map((item) => (
              <MultiSelectOption
                key={item.value}
                label={item.label}
                value={item.value}
                selected={nails.includes(item.value)}
                onPress={() => toggleOption(nails, setNails, item.value)}
              />
            ))}
          </View>
        </View>

        {/* 5. Scalp */}
        <View style={styles.section}>
          <QuestionWithNote
            question="Do you have scalp involvement?"
            note="select all that apply"
          />
          <View style={styles.checkboxGroup}>
            {[
              { value: 'flaking', label: 'Flaking' },
              { value: 'itching', label: 'Itching' },
              { value: 'hairLoss', label: 'Hair loss' },
            ].map((item) => (
              <MultiSelectOption
                key={item.value}
                label={item.label}
                value={item.value}
                selected={scalp.includes(item.value)}
                onPress={() => toggleOption(scalp, setScalp, item.value)}
              />
            ))}
          </View>
        </View>

        <View style={{ height: hp(8) }} />
      </ScrollView>

      {/* FAB  */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          router.push('/assess2');
        }}
      >
        <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
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
  content: { flex: 1, paddingHorizontal: wp(6), paddingTop: hp(2) },
  greeting: {
    fontSize: hp(3),
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: hp(3),
    lineHeight: hp(3.8),
  },
  sectionTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(3),
  },
  section: { marginBottom: hp(3) },

  /* LABEL */
  label: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(1.5),
  },

  /* QUESTION + NOTE */
  questionContainer: { marginBottom: hp(1.5) },
  questionText: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#000',
    lineHeight: hp(3.2),
  },
  noteText: {
    fontSize: hp(1.5),
    color: '#666',
    fontStyle: 'italic',
    marginTop: hp(0.1),
  },

  /* RADIO */
  radioGroup: { gap: hp(1.5) },
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
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  radioLabel: { fontSize: hp(1.5), color: '#666' },
  radioLabelSelected: { color: '#007AFF', fontWeight: '500' },

  /* CHECKBOX */
  checkboxGroup: { gap: hp(1.5) },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  checkboxOptionSelected: {
    backgroundColor: '#E5F1FF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  checkboxCheck: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#007AFF' },
  checkboxLabel: { fontSize: hp(1.5), color: '#666' },
  checkboxLabelSelected: { color: '#007AFF', fontWeight: '500' },

  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    justifyContent: 'center',
    textAlign: 'left',
    fontSize: hp(1.5),
  },

  /* FAB Bottom Right */
  fab: {
    position: 'absolute',
    right: wp(8),
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