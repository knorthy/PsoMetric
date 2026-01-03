import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AssessmentContext = createContext();

const STORAGE_KEY = '@psometric_assessment';

const initialAssessment = {
  // Basic Info
  gender: '',
  age: '',
  psoriasisHistory: '',
  // Symptoms
  location: [],
  appearance: [],
  size: [],
  // Severity
  itching: 0,
  pain: 0,
  // Impact & Joints
  dailyImpact: '',
  jointPain: '',
  jointsAffected: [],
  // Treatment
  currentTreatment: '',
};

export const AssessmentProvider = ({ children }) => {
  const [assessment, setAssessment] = useState(initialAssessment);

  // Load saved assessment from AsyncStorage on mount
  useEffect(() => {
    loadAssessment();
  }, []);

  // Save to AsyncStorage whenever data changes
  useEffect(() => {
    saveAssessment();
  }, [assessment]);

  const loadAssessment = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setAssessment((prev) => ({ ...prev, ...data }));
        console.log('✅ Assessment data restored from storage');
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
    }
  };

  const saveAssessment = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }
  };

  const updateAssessment = (data) => {
    setAssessment((prev) => ({ ...prev, ...data }));
  };

  const getFullQuestionnaire = () => {
    return {
      timestamp: new Date().toISOString(),
      ...assessment,
    };
  };

  const resetAssessment = async () => {
    setAssessment(initialAssessment);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ Assessment data cleared');
    } catch (error) {
      console.error('Failed to clear assessment:', error);
    }
  };

  const value = {
    assessment,
    updateAssessment,
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
