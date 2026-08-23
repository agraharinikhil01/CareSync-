import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hms_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hms_token');
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Failed to verify stored session:', error);
          localStorage.removeItem('hms_token');
          localStorage.removeItem('hms_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginApi({ email, password });
      if (res.data.success) {
        const { token: receivedToken, ...userData } = res.data.data;
        localStorage.setItem('hms_token', receivedToken);
        localStorage.setItem('hms_user', JSON.stringify(userData));
        setToken(receivedToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Connecting to backend server... Please try in 2 seconds.' : 'Invalid email or password.'),
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await registerApi(formData);
      if (res.data.success) {
        const { token: receivedToken, ...userData } = res.data.data;
        localStorage.setItem('hms_token', receivedToken);
        localStorage.setItem('hms_user', JSON.stringify(userData));
        setToken(receivedToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please check details.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
