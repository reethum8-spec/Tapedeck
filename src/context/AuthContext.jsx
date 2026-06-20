import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = await authService.getUser();
        const storedOnboarded = await authService.getOnboardedStatus();
        
        if (storedUser) {
          setUser(storedUser);
        }
        if (storedOnboarded) {
          setHasOnboarded(true);
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await authService.saveUser(userData);
  };

  const logout = async () => {
    setUser(null);
    setHasOnboarded(false);
    await authService.clearUser();
  };

  const completeOnboarding = async (preferences) => {
    const updatedUser = { 
      ...user, 
      ...preferences,
      bio: "Just a mixtape enthusiast.",
      isPublic: true,
      stats: { listeningTime: 120, tapesCreated: 0 },
      unlockedCompanions: [preferences.companion || 'cat'],
      companionSettings: { sfxEnabled: true, animationSpeed: 50, customNames: {} }
    };
    setUser(updatedUser);
    setHasOnboarded(true);
    await authService.saveUser(updatedUser);
    await authService.setOnboardedStatus(true);
  };

  const updateProfile = async (data) => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    await authService.saveUser(updatedUser);
  };

  const updateCompanionSettings = async (settings) => {
    const updatedUser = { ...user, companionSettings: { ...user.companionSettings, ...settings } };
    setUser(updatedUser);
    await authService.saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      hasOnboarded,
      isLoading,
      login,
      logout,
      completeOnboarding,
      updateProfile,
      updateCompanionSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};
