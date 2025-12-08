import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AuthenticationDetails,
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool,
    CognitoUserSession
} from 'amazon-cognito-identity-js';
import 'react-native-get-random-values';
import amplifyconfig from '../amplifyconfiguration.json';

// Polyfill for amazon-cognito-identity-js
if (typeof global.navigator === 'undefined') global.navigator = {};
if (typeof global.navigator.userAgent === 'undefined') global.navigator.userAgent = 'react-native';

// In-memory storage implementation for amazon-cognito-identity-js
// This library requires synchronous storage, which AsyncStorage is not.
class MemoryStorage {
  constructor() {
    this.cache = {};
  }

  setItem(key, value) {
    this.cache[key] = value;
    // Async backup to AsyncStorage (fire and forget)
    AsyncStorage.setItem(key, value).catch(console.error);
    return value;
  }

  getItem(key) {
    // Return from memory (sync)
    return Object.prototype.hasOwnProperty.call(this.cache, key) ? this.cache[key] : null;
  }

  removeItem(key) {
    delete this.cache[key];
    AsyncStorage.removeItem(key).catch(console.error);
  }

  clear() {
    this.cache = {};
    AsyncStorage.clear().catch(console.error);
  }
  
  // Helper to load data from AsyncStorage into memory on startup
  async sync() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      result.forEach(([key, value]) => {
        if (value) this.cache[key] = value;
      });
      console.log('✅ Cognito storage synced');
    } catch (e) {
      console.error('Failed to sync Cognito storage', e);
    }
  }
}

const storage = new MemoryStorage();

// Initialize User Pool
const poolData = {
  UserPoolId: amplifyconfig.aws_user_pools_id,
  ClientId: amplifyconfig.aws_user_pools_web_client_id,
  Storage: storage // Use synchronous memory storage
};

const userPool = new CognitoUserPool(poolData);

console.log('⚙️ Cognito Configured:', {
  UserPoolId: poolData.UserPoolId,
  ClientId: poolData.ClientId,
  Region: amplifyconfig.aws_project_region
});

// Export sync function to be called by AuthContext
export const syncAuthStorage = () => storage.sync();

/**
 * Sign in user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<any>}
 */
export const signIn = (email, password) => {
  return new Promise((resolve, reject) => {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool,
      Storage: storage
    };
    const cognitoUser = new CognitoUser(userData);

    // Force cleanup of any existing session to avoid "Invalid session" errors
    try {
        // Clear memory storage directly to ensure no stale data
        storage.clear();
        cognitoUser.signOut();
    } catch (e) {
        // Ignore errors during cleanup
    }

    // Try USER_PASSWORD_AUTH first (simpler, less crypto dependency)
    // If this fails with "Auth flow not enabled", we might need to fallback or enable it in AWS
    cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve({
          isSignedIn: true,
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
          userId: result.getIdToken().payload.sub,
          username: result.getIdToken().payload.email,
          name: result.getIdToken().payload.name
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle new password challenge if needed
        reject({ code: 'NEW_PASSWORD_REQUIRED', message: 'New password required' });
      }
    });
  });
};

/**
 * Sign up user
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 * @returns {Promise<any>}
 */
export const signUp = (email, password, name) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];
    
    const dataEmail = {
      Name: 'email',
      Value: email,
    };
    const dataName = {
      Name: 'name',
      Value: name,
    };

    attributeList.push(new CognitoUserAttribute(dataEmail));
    attributeList.push(new CognitoUserAttribute(dataName));

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.error('SignUp Error:', err);
        reject(err);
        return;
      }
      console.log('✅ SignUp Success:', result);
      resolve({ isSignUpComplete: false, userId: result.userSub });
    });
  });
};

/**
 * Confirm sign up
 * @param {string} email 
 * @param {string} code 
 * @returns {Promise<any>}
 */
export const confirmSignUp = (email, code) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
      Storage: storage
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ isSignUpComplete: true });
    });
  });
};

/**
 * Resend confirmation code
 * @param {string} email 
 * @returns {Promise<any>}
 */
export const resendSignUpCode = (email) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
      Storage: storage
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Sign out
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

/**
 * Get current authenticated user session
 * @returns {Promise<any>}
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject({ message: 'No user found' });
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (session.isValid()) {
        resolve({
          username: session.getIdToken().payload.email,
          userId: session.getIdToken().payload.sub,
          name: session.getIdToken().payload.name,
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken()
        });
      } else {
        reject({ message: 'Session invalid' });
      }
    });
  });
};

/**
 * Get auth headers for API calls
 * @returns {Promise<object>}
 */
export const getAuthHeaders = async () => {
  try {
    const user = await getCurrentUser();
    return {
      Authorization: `Bearer ${user.idToken}`
    };
  } catch (error) {
    return {};
  }
};

/**
 * Save session from external tokens (e.g. Hosted UI)
 * @param {object} tokenResult - { accessToken, idToken, refreshToken }
 * @returns {Promise<object>} - User object
 */
export const saveSessionFromExternalTokens = async (tokenResult) => {
  const { accessToken, idToken, refreshToken } = tokenResult;
  
  if (!accessToken || !idToken) {
    throw new Error('Missing tokens');
  }

  // Parse tokens
  const idTokenObj = new CognitoIdToken({ IdToken: idToken });
  const accessTokenObj = new CognitoAccessToken({ AccessToken: accessToken });
  const refreshTokenObj = new CognitoRefreshToken({ RefreshToken: refreshToken });
  
  const username = idTokenObj.payload.email; // Use email as username
  const userId = idTokenObj.payload.sub;
  const name = idTokenObj.payload.name;
  const clientId = poolData.ClientId;

  // Construct keys
  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}.${username}`;
  const lastUserKey = `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`;

  // Save to storage
  storage.setItem(lastUserKey, username);
  storage.setItem(`${keyPrefix}.idToken`, idToken);
  storage.setItem(`${keyPrefix}.accessToken`, accessToken);
  if (refreshToken) {
    storage.setItem(`${keyPrefix}.refreshToken`, refreshToken);
  }
  
  // Also construct a session object to verify validity
  const session = new CognitoUserSession({
    IdToken: idTokenObj,
    AccessToken: accessTokenObj,
    RefreshToken: refreshTokenObj
  });

  if (!session.isValid()) {
    throw new Error('Invalid session tokens');
  }

  console.log('✅ External session saved for:', username);

  return {
    username,
    userId,
    name,
    accessToken,
    idToken,
    refreshToken
  };
};
