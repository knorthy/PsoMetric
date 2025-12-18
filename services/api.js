import { getAuthHeaders, getCurrentUser } from './cognito';

// API URL from environment variable
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.68.109:8000';

export const fetchAssessmentHistory = async () => {
  try {
    const user = await getCurrentUser();
    const headers = await getAuthHeaders();
    // Updated to match new backend structure (everything under /analyze/)
    const response = await fetch(`${BASE_URL}/analyze/history/${user.userId}`, {
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
    // Updated to match new backend structure
    const response = await fetch(`${BASE_URL}/analyze/result/${user.userId}/${encodedTimestamp}`, {
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
