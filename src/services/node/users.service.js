// services/users.service.js
import { crud } from '../api'

const RESOURCE = 'users'

/**
 * Crea un nuevo usuario
 * @param {Object} payload - Los datos del usuario
 * @param {string} payload.name - Nombre del usuario
 * @param {string} payload.email - Email del usuario (único)
 * @param {string} payload.password - Contraseña del usuario
 * @param {string} [payload.role] - Rol del usuario (opcional)
 * @returns {Promise} Promesa que resuelve con los datos del usuario creado
 */
export const createUser = (payload) => crud.post(`/${RESOURCE}`, payload)

/**
 * Obtiene todos los usuarios
 * @returns {Promise} Promesa que resuelve con la lista de todos los usuarios
 */
export const getUsers = () => crud.get(`/${RESOURCE}`)

/**
 * Obtiene un usuario por su ID
 * @param {string} userId - ID del usuario a obtener
 * @returns {Promise} Promesa que resuelve con los datos del usuario
 */
export const getUser = (userId) => crud.get(`/${RESOURCE}/${userId}`)

/**
 * Actualiza un usuario existente
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} payload - Los datos del usuario a actualizar
 * @param {string} [payload.name] - Nombre del usuario
 * @param {string} [payload.email] - Email del usuario
 * @param {string} [payload.password] - Nueva contraseña del usuario
 * @param {string} [payload.role] - Rol del usuario
 * @returns {Promise} Promesa que resuelve con los datos del usuario actualizado
 */
export const updateUser = (userId, payload) => crud.put(`/${RESOURCE}/${userId}`, payload)

/**
 * Elimina un usuario
 * @param {string} userId - ID del usuario a eliminar
 * @returns {Promise} Promesa que resuelve con confirmación de eliminación
 */
export const deleteUser = (userId) => crud.delete(`/${RESOURCE}/${userId}`)