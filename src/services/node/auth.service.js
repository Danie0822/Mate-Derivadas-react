// services/auth.service.js
import { crud } from '../api'

const RESOURCE = 'auth'

/**
 * Inicia sesión en el sistema
 * @param {Object} payload - Los datos de login
 * @param {string} payload.email - Email del usuario
 * @param {string} payload.password - Contraseña del usuario
 * @returns {Promise} Promesa que resuelve con el token JWT y datos del usuario
 * @example
 * // Ejemplo de uso:
 * const loginData = await loginUser({
 *   email: "usuario@example.com",
 *   password: "miPassword123"
 * })
 * // Retorna: { token: "jwt_token_here", user: { id, name, email, role } }
 */
export const loginUser = (payload) => crud.post(`/${RESOURCE}/login`, payload)

// Nota: Las funciones de logout, getCurrentUser e isAuthenticated 
// ya están implementadas en api.js y manejan el localStorage directamente