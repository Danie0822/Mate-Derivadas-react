import { useState } from 'react';
import { login as loginService, logout as logoutService } from '../services/node/auth.service';
import { useAuth } from '../context/AuthContext';

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginSuccess, logout: contextLogout } = useAuth();

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { user } = await loginService(email, password);
      loginSuccess(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      logoutService();
      contextLogout();
      return { success: true };
    } catch (err) {
      console.error('Error during logout:', err);
      return { success: false, error: 'Error al cerrar sesión' };
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
