import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AssessmentContext = createContext();

const STORAGE_KEY = '@psometric_assessment';

export const AssessmentProvider = ({ children }) => {
  // Screen 1: Basic Info & Symptom Description
  const [screen1, setScreen1] = useState({
    gender: '',
    age: '',
    psoriasisHistory: '',
    location: [],
    appearance: [],
    size: [],
    nails: [],
    scalp: [],
  });

  // Screen 2: Onset, Duration & Severity
  const [screen2, setScreen2] = useState({
    onsetDate: '',
    symptomPattern: '',
    lesionSpeed: '',
    itching: 0,
    burning: 0,
    pain: 0,
    bleeding: 0,
    worsenAtNight: '',
    worsenWithStress: '',
    triggers: [],
    medTriggers: [],
    sunlightEffect: '',
  });

  // Screen 3: Impact, Medical History & Treatment
  const [screen3, setScreen3] = useState({
    dailyImpact: '',
    emotionalImpact: '',
    relationshipsImpact: '',
    jointPain: '',
    jointsAffected: [],
    nailWithJoint: '',
    pastTreatments: '',
    familyHistory: [],
    otherConditions: [],
    currentTreatment: '',
    reliefSideEffects: '',
    triedSystemic: '',
    feverInfection: '',
    weightLossFatigue: '',
  });

  // Load saved assessment from AsyncStorage on mount
  useEffect(() => {
    loadAssessment();
  }, []);

  // Save to AsyncStorage whenever data changes
  useEffect(() => {
    saveAssessment();
  }, [screen1, screen2, screen3]);

  const loadAssessment = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.screen1) setScreen1(data.screen1);
        if (data.screen2) setScreen2(data.screen2);
        if (data.screen3) setScreen3(data.screen3);
        console.log('✅ Assessment data restored from storage');
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
    }
  };

  const saveAssessment = async () => {
    try {
      const data = { screen1, screen2, screen3 };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }
  };

  const updateScreen1 = (data) => {
    setScreen1((prev) => ({ ...prev, ...data }));
  };

  const updateScreen2 = (data) => {
    setScreen2((prev) => ({ ...prev, ...data }));
  };

  const updateScreen3 = (data) => {
    setScreen3((prev) => ({ ...prev, ...data }));
  };

  const getFullQuestionnaire = () => {
    return {
      timestamp: new Date().toISOString(),
      screen1: { ...screen1 },
      screen2: { ...screen2 },
      screen3: { ...screen3 },
    };
  };

  const resetAssessment = async () => {
    setScreen1({
      gender: '',
      age: '',
      psoriasisHistory: '',
      location: [],
      appearance: [],
      size: [],
      nails: [],
      scalp: [],
    });
    setScreen2({
      onsetDate: '',
      symptomPattern: '',
      lesionSpeed: '',
      itching: 0,
      burning: 0,
      pain: 0,
      bleeding: 0,
      worsenAtNight: '',
      worsenWithStress: '',
      triggers: [],
      medTriggers: [],
      sunlightEffect: '',
    });
    setScreen3({
      dailyImpact: '',
      emotionalImpact: '',
      relationshipsImpact: '',
      jointPain: '',
      jointsAffected: [],
      nailWithJoint: '',
      pastTreatments: '',
      familyHistory: [],
      otherConditions: [],
      currentTreatment: '',
      reliefSideEffects: '',
      triedSystemic: '',
      feverInfection: '',
      weightLossFatigue: '',
    });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ Assessment data cleared');
    } catch (error) {
      console.error('Failed to clear assessment:', error);
    }
  };

  const value = {
    screen1,
    screen2,
    screen3,
    updateScreen1,
    updateScreen2,
    updateScreen3,
    getFullQuestionnaire,
    resetAssessment,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};
