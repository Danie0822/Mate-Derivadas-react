// services/user-exercises.service.js
import { crud } from '../api'

const RESOURCE = 'user-exercises'

/**
 * Crea un nuevo registro de ejercicio del usuario
 * @param {Object} payload - Los datos del registro de ejercicio del usuario
 * @param {string} payload.user_id - ID del usuario
 * @param {string} payload.exercise_id - ID del ejercicio
 * @param {string} [payload.status] - Estado del ejercicio (pending, in_progress, completed, failed)
 * @param {Object} [payload.user_answer] - Respuesta del usuario al ejercicio
 * @param {number} [payload.score] - Puntuación obtenida (0-100)
 * @param {number} [payload.attempts] - Número de intentos realizados
 * @param {Date} [payload.started_at] - Fecha y hora de inicio
 * @param {Date} [payload.completed_at] - Fecha y hora de finalización
 * @returns {Promise} Promesa que resuelve con los datos del registro creado
 */
export const createUserExercise = (payload) => crud.post(`/${RESOURCE}`, payload)

/**
 * Obtiene todos los registros de ejercicios de usuarios
 * @returns {Promise} Promesa que resuelve con la lista de todos los registros
 */
export const getUserExercises = () => crud.get(`/${RESOURCE}`)

/**
 * Obtiene un registro de ejercicio del usuario por su ID
 * @param {string} userExerciseId - ID del registro a obtener
 * @returns {Promise} Promesa que resuelve con los datos del registro
 */
export const getUserExercise = (userExerciseId) => crud.get(`/${RESOURCE}/${userExerciseId}`)

/**
 * Actualiza un registro de ejercicio del usuario existente
 * @param {string} userExerciseId - ID del registro a actualizar
 * @param {Object} payload - Los datos del registro a actualizar
 * @param {string} [payload.status] - Estado del ejercicio
 * @param {Object} [payload.user_answer] - Respuesta del usuario al ejercicio
 * @param {number} [payload.score] - Puntuación obtenida (0-100)
 * @param {number} [payload.attempts] - Número de intentos realizados
 * @param {Date} [payload.started_at] - Fecha y hora de inicio
 * @param {Date} [payload.completed_at] - Fecha y hora de finalización
 * @returns {Promise} Promesa que resuelve con los datos del registro actualizado
 */
export const updateUserExercise = (userExerciseId, payload) => crud.put(`/${RESOURCE}/${userExerciseId}`, payload)

/**
 * Elimina un registro de ejercicio del usuario
 * @param {string} userExerciseId - ID del registro a eliminar
 * @returns {Promise} Promesa que resuelve con confirmación de eliminación
 */
export const deleteUserExercise = (userExerciseId) => crud.delete(`/${RESOURCE}/${userExerciseId}`)