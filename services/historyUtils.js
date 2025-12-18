import { fetchAssessmentHistory, fetchAssessmentResult } from './api';

/**
 * Format history data from backend response
 */
export const formatHistoryData = (data) => {
  const list = data?.assessments || (Array.isArray(data) ? data : []);
  
  const formatted = list.map((item, index) => {
    const dateStr = item.created_at || item.timestamp;
    return {
      id: item.assessment_id || item.id || String(index),
      title: dateStr 
        ? new Date(dateStr).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) 
        : `Assessment ${index + 1}`,
      created_at: dateStr,
      timestamp: dateStr,
      ...item
    };
  });
  
  // Sort by date, newest first
  formatted.sort((a, b) => {
    const dateA = a.created_at || a.timestamp;
    const dateB = b.created_at || b.timestamp;
    if (dateA && dateB) {
      return new Date(dateB) - new Date(dateA);
    }
    return 0;
  });
  
  return formatted;
};

/**
 * Load assessment history from API
 */
export const loadAssessmentHistory = async () => {
  const data = await fetchAssessmentHistory();
  return formatHistoryData(data);
};

/**
 * Prepare navigation params from backend assessment result
 */
export const prepareResultParams = (fullResult) => {
  const questionnaire = fullResult.questionnaire || {};
  
  return {
    // ML Analysis fields
    global_score: fullResult.global_score,
    diagnosis: fullResult.diagnosis,
    erythema: fullResult.erythema,
    induration: fullResult.induration,
    scaling: fullResult.scaling,
    lesions_found: fullResult.lesions_found,
    annotated_image_base64: fullResult.annotated_image_base64,
    
    // LLM recommendations (stringify arrays for router)
    next_steps: JSON.stringify(fullResult.next_steps || []),
    additional_notes: fullResult.additional_notes,
    
    // Questionnaire fields (flattened, stringify arrays)
    gender: questionnaire.gender || fullResult.gender,
    age: questionnaire.age || fullResult.age,
    psoriasisHistory: questionnaire.psoriasisHistory || fullResult.psoriasisHistory,
    location: JSON.stringify(questionnaire.location || fullResult.location || []),
    appearance: JSON.stringify(questionnaire.appearance || fullResult.appearance || []),
    size: JSON.stringify(questionnaire.size || fullResult.size || []),
    itching: questionnaire.itching ?? fullResult.itching ?? 0,
    pain: questionnaire.pain ?? fullResult.pain ?? 0,
    jointPain: questionnaire.jointPain || fullResult.jointPain,
    jointsAffected: JSON.stringify(questionnaire.jointsAffected || fullResult.jointsAffected || []),
    dailyImpact: questionnaire.dailyImpact || fullResult.dailyImpact,
    currentTreatment: questionnaire.currentTreatment || fullResult.currentTreatment,
    
    // Metadata
    assessment_id: fullResult.assessment_id,
    created_at: fullResult.created_at,
  };
};

/**
 * Get full assessment and prepare params for navigation
 */
export const getAssessmentForNavigation = async (assessment) => {
  const lookupDate = assessment.created_at || assessment.timestamp;
  
  if (!lookupDate) {
    return assessment;
  }
  
  const fullResult = await fetchAssessmentResult(lookupDate);
  return prepareResultParams(fullResult);
};
