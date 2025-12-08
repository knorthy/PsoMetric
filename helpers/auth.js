import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

/**
 * Get the current user's Cognito JWT token
 * @returns {Promise<{token: string, userId: string} | null>}
 */
export async function getCognitoAuth() {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user || !user.userId) {
      console.warn('No authenticated user found');
      return null;
    }

    // Fetch auth session to get tokens
    const session = await fetchAuthSession();
    
    if (!session.tokens) {
      console.warn('No tokens found in session');
      return null;
    }

    // Get the ID token (contains user claims)
    const idToken = session.tokens.idToken?.toString();
    
    if (!idToken) {
      console.warn('No ID token found');
      return null;
    }

    return {
      token: idToken,
      userId: user.userId,
      username: user.username,
    };
  } catch (error) {
    console.error('Failed to get Cognito auth:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Get authorization header with Bearer token
 * @returns {Promise<{Authorization: string} | {}>}
 */
export async function getAuthHeaders() {
  try {
    const auth = await getCognitoAuth();
    
    if (!auth || !auth.token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${auth.token}`,
    };
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    return {};
  }
}
