// services/user-progress.service.js
import { crud } from '../api'

const RESOURCE = 'user-progress'

/**
 * Crea un nuevo registro de progreso del usuario
 * @param {Object} payload - Los datos del registro de progreso del usuario
 * @param {string} payload.user_id - ID del usuario
 * @param {string} [payload.topic] - Tema del progreso (derivadas, integrales, etc.)
 * @param {string} [payload.level] - Nivel actual del usuario (beginner, intermediate, advanced)
 * @param {number} [payload.total_exercises] - Total de ejercicios en el tema
 * @param {number} [payload.completed_exercises] - Ejercicios completados
 * @param {number} [payload.correct_answers] - Respuestas correctas
 * @param {number} [payload.average_score] - Puntuación promedio (0-100)
 * @param {number} [payload.time_spent] - Tiempo total invertido (en minutos)
 * @param {Date} [payload.last_activity] - Última actividad registrada
 * @returns {Promise} Promesa que resuelve con los datos del progreso creado
 */
export const createUserProgress = (payload) => crud.post(`/${RESOURCE}`, payload)

/**
 * Obtiene todos los registros de progreso de usuarios
 * @returns {Promise} Promesa que resuelve con la lista de todos los progresos
 */
export const getUserProgresses = () => crud.get(`/${RESOURCE}`)

/**
 * Obtiene un registro de progreso del usuario por su ID
 * @param {string} userProgressId - ID del registro de progreso a obtener
 * @returns {Promise} Promesa que resuelve con los datos del progreso
 */
export const getUserProgress = (userProgressId) => crud.get(`/${RESOURCE}/${userProgressId}`)

/**
 * Actualiza un registro de progreso del usuario existente
 * @param {string} userProgressId - ID del registro de progreso a actualizar
 * @param {Object} payload - Los datos del progreso a actualizar
 * @param {string} [payload.topic] - Tema del progreso
 * @param {string} [payload.level] - Nivel actual del usuario
 * @param {number} [payload.total_exercises] - Total de ejercicios en el tema
 * @param {number} [payload.completed_exercises] - Ejercicios completados
 * @param {number} [payload.correct_answers] - Respuestas correctas
 * @param {number} [payload.average_score] - Puntuación promedio (0-100)
 * @param {number} [payload.time_spent] - Tiempo total invertido (en minutos)
 * @param {Date} [payload.last_activity] - Última actividad registrada
 * @returns {Promise} Promesa que resuelve con los datos del progreso actualizado
 */
export const updateUserProgress = (userProgressId, payload) => crud.put(`/${RESOURCE}/${userProgressId}`, payload)

/**
 * Elimina un registro de progreso del usuario
 * @param {string} userProgressId - ID del registro de progreso a eliminar
 * @returns {Promise} Promesa que resuelve con confirmación de eliminación
 */
export const deleteUserProgress = (userProgressId) => crud.delete(`/${RESOURCE}/${userProgressId}`)