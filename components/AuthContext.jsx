import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut, syncAuthStorage } from '../services/cognito';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [avatar, setAvatar] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      // Sync storage first (load from AsyncStorage to Memory)
      await syncAuthStorage();
      // Then check status
      await checkAuthStatus();

      // Load persisted avatar URI (if any)
      try {
        const stored = await AsyncStorage.getItem('user_avatar_uri');
        if (stored) setAvatar(stored);
      } catch (e) {
        console.error('Failed to load avatar from storage', e);
      }
    };
    
    initAuth();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      setUser({ username: currentUser.username, userId: currentUser.userId });
      setSession(currentUser); // Contains tokens
      
      console.log('✅ User authenticated:', currentUser.username);
    } catch (error) {
      // Silent fail - user is just not authenticated
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    // amazon-cognito-identity-js handles refresh automatically in getSession
    return checkAuthStatus();
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
      console.log('✅ User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getAuthToken = () => {
    if (!session?.idToken) return null;
    return session.idToken;
  };

  const getUserId = () => {
    return user?.userId || null;
  };

  // Optimization: Allow manual state update to avoid re-fetching
  const setAuth = (authData) => {
    if (authData) {
      setUser({ username: authData.username, userId: authData.userId });
      setSession(authData);
    } else {
      setUser(null);
      setSession(null);
    }
  };

  // Persist avatar URI and update state
  const setAndPersistAvatar = async (uri) => {
    try {
      if (uri) {
        await AsyncStorage.setItem('user_avatar_uri', uri);
        setAvatar(uri);
      } else {
        await AsyncStorage.removeItem('user_avatar_uri');
        setAvatar(null);
      }
    } catch (e) {
      console.error('Failed to persist avatar', e);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    checkAuthStatus,
    refreshSession,
    logout,
    getAuthToken,
    getUserId,
    setAuth, // Export this
    // Avatar: uri string or null
    avatar,
    setAvatar: setAndPersistAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
