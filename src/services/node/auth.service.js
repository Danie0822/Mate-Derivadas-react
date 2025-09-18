// services/auth.service.js
import { nodeApi } from '../api'

const RESOURCE = 'auth'

// Obtiene el token JWT almacenado
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Inicia sesión en el sistema
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise} Promesa que resuelve con el token JWT y datos del usuario
 * @example
 * const { token, user } = await login("usuario@example.com", "miPassword123")
 */
export const login = async (email, password) => {
  const res = await nodeApi.post(`/${RESOURCE}/login`, { email, password });
  // La respuesta real tiene la estructura: { success, route, message, data: { token, user } }
  const { token, user } = res.data.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
};

/**
 * Cierra sesión del usuario eliminando datos del localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Obtiene el usuario actual almacenado en localStorage
 * @returns {Object|null} Objeto del usuario o null si no existe
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user && user !== "undefined" ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Obtiene el token JWT del localStorage
 * @returns {string|null} Token JWT o null si no existe
 */
export const getAuthToken = getToken;