import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getProfile as apiGetProfile, getEntities as apiGetEntities } from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data", error);
          logout();
        }
      }
      setLoading(false);
    };
    initializeUser();
  }, []);

  const finishLogin = (userData, profileData, entitiesData) => {
    const finalUserData = { 
      ...userData, 
      ...profileData,
      entities: entitiesData || []
    };
    setUser(finalUserData);
    localStorage.setItem('user', JSON.stringify(finalUserData));
  };
  
  const login = async (email, password) => {
    const response = await fetch('https://login-api.snolep.com/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body: new URLSearchParams({
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
    }
    
    if (data.role !== 'CLIENT_USER') {
        throw new Error('Permission Denied. Only client users can log in.');
    }
    
    const [profileData, entitiesData] = await Promise.all([
        apiGetProfile(data.access_token),
        apiGetEntities(data.access_token)
    ]);
    
    if (profileData.is_2fa_enabled) {
      return { twoFactorEnabled: true, loginData: { ...data, ...profileData, entities: entitiesData } };
    } else {
      finishLogin(data, profileData, entitiesData);
      return { twoFactorEnabled: false };
    }
  };
  
  const verifyOtpAndFinishLogin = async (loginData, otp) => {
    // Here you might want to call a verify OTP endpoint
    // For now, we assume if we are here, OTP is correct and we can finish login
    finishLogin(loginData, {}, loginData.entities);
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('entityData');
    localStorage.removeItem('beneficiaries');
  };

  const updateUser = useCallback((updatedData) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedData };
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    });
  }, []);

  const value = {
    user,
    login,
    verifyOtpAndFinishLogin,
    logout,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};