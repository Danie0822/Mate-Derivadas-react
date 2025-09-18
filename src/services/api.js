import axios from 'axios';

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:3000'; // URL de la API Node.js de ejemplo
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'; // URL de la API Python de ejemplo

// Obtiene el token JWT almacenado
function getToken() {
  return localStorage.getItem('token');
}

// Instancia de axios para Node.js API con interceptores para JWT
const nodeApi = axios.create({
  baseURL: NODE_API_URL,
});

// Instancia de axios para Python API
const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 60000, // 60 segundos para operaciones como PDF processing
});

// Interceptores para Node.js API (con autenticación JWT)
nodeApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

nodeApi.interceptors.response.use(
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

// Interceptores para Python API (sin autenticación)
pythonApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Python API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper para extraer el .data.data de la respuesta de Node.js API
const extractNodeData = (promise) =>
  promise.then(res => res.data.data);

// Helper para extraer data de la respuesta de Python API
const extractPythonData = (promise) =>
  promise.then(res => res.data);

// CRUD genérico para Node.js API
export const crud = {
  get: (url, params) => extractNodeData(nodeApi.get(url, { params })),
  post: (url, data) => extractNodeData(nodeApi.post(url, data)),
  put: (url, data) => extractNodeData(nodeApi.put(url, data)),
  delete: (url) => extractNodeData(nodeApi.delete(url)),
};

// CRUD genérico para Python API
export const pythonCrud = {
  get: (url, params) => extractPythonData(pythonApi.get(url, { params })),
  post: (url, data) => extractPythonData(pythonApi.post(url, data)),
  put: (url, data) => extractPythonData(pythonApi.put(url, data)),
  delete: (url) => extractPythonData(pythonApi.delete(url)),
  // Para subida de archivos
  postFile: (url, formData) => extractPythonData(
    pythonApi.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  )
};

// Login
export const login = async (email, password) => {
  const res = await nodeApi.post('/auth/login', { email, password });
  // La respuesta real tiene la estructura: { success, route, message, data: { token, user } }
  const { token, user } = res.data.data;
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

// Exportar las instancias de axios por si se necesitan directamente
export { nodeApi, pythonApi };
export default nodeApi;
