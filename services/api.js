import { getAuthHeaders, getCurrentUser } from './cognito';

// Backend API URL (hardcoded)
const BASE_URL = 'http://192.168.68.101:8000';

// Get presigned S3 URL for image upload
export const getPresignedUploadUrl = async (fileName, fileType) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/analyze/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ fileName, fileType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.status}`);
    }

    return await response.json(); // { uploadUrl, imageUrl }
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
};

// Upload image directly to S3 using presigned URL
export const uploadImageToS3 = async (presignedUrl, imageUri, fileType) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

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
