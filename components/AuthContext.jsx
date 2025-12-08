import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut, syncAuthStorage } from '../services/cognito';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      // Sync storage first (load from AsyncStorage to Memory)
      await syncAuthStorage();
      // Then check status
      checkAuthStatus();
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
