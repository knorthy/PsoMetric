import { getAuthHeaders, getCurrentUser } from './cognito';

const BASE_URL = 'http://192.168.68.119:8000';

export const fetchAssessmentHistory = async () => {
  try {
    const user = await getCurrentUser();
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/questionnaire/history/${user.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assessment history: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    throw error;
  }
};

export const fetchAssessmentResult = async (timestamp) => {
  try {
    const user = await getCurrentUser();
    const headers = await getAuthHeaders();
    const encodedTimestamp = encodeURIComponent(timestamp);
    const response = await fetch(`${BASE_URL}/questionnaire/result/${user.userId}/${encodedTimestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assessment result: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching assessment result:', error);
    throw error;
  }
};
