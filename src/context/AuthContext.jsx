import { createContext, useContext, useReducer, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/node/auth.service';

// Estado inicial
const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// Tipos de acciones
const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
};

// Reducer para manejar el estado de autenticación
function authReducer(state, action) {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case authActions.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al inicializar
  useEffect(() => {
    const checkAuth = () => {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      
      try {
        if (isAuthenticated()) {
          const user = getCurrentUser();
          dispatch({ type: authActions.SET_USER, payload: user });
        } else {
          dispatch({ type: authActions.SET_USER, payload: null });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        dispatch({ type: authActions.SET_USER, payload: null });
      }
    };

    checkAuth();
  }, []);

  // Acciones del contexto
  const actions = {
    loginSuccess: (user) => {
      dispatch({ type: authActions.LOGIN_SUCCESS, payload: { user } });
    },
    logout: () => {
      dispatch({ type: authActions.LOGOUT });
    },
    setLoading: (loading) => {
      dispatch({ type: authActions.SET_LOADING, payload: loading });
    },
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
