import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Obtiene el token JWT almacenado
function getToken() {
  return localStorage.getItem('token');
}

// Instancia de axios con interceptores para JWT
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si es error 401, limpiar el localStorage y redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper para extraer el .data de la respuesta
const extractData = (promise) =>
  promise.then(res => res.data);

// CRUD genérico
export const crud = {
  get: (url, params) => extractData(api.get(url, { params })),
  post: (url, data) => extractData(api.post(url, data)),
  put: (url, data) => extractData(api.put(url, data)),
  delete: (url) => extractData(api.delete(url)),
};

// Login
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Obtener usuario actual: retorna el objeto user parseado o null
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user && user !== "undefined" ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user);
};

export default api;
