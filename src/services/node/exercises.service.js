// services/exercises.service.js
import { crud } from '../api'

const RESOURCE = 'exercises'

/**
 * Crea un nuevo ejercicio
 * @param {Object} payload - Los datos del ejercicio
 * @param {string} payload.title - Título del ejercicio
 * @param {string} payload.description - Descripción del ejercicio
 * @param {string} payload.content - Contenido del ejercicio (puede ser HTML/Markdown)
 * @param {string} [payload.difficulty] - Dificultad del ejercicio (easy, medium, hard)
 * @param {string} [payload.topic] - Tema del ejercicio
 * @param {Array} [payload.tags] - Etiquetas del ejercicio
 * @param {Object} [payload.solution] - Solución del ejercicio
 * @returns {Promise} Promesa que resuelve con los datos del ejercicio creado
 */
export const createExercise = (payload) => crud.post(`/${RESOURCE}`, payload)

/**
 * Obtiene todos los ejercicios
 * @returns {Promise} Promesa que resuelve con la lista de todos los ejercicios
 */
export const getExercises = () => crud.get(`/${RESOURCE}`)

/**
 * Obtiene un ejercicio por su ID
 * @param {string} exerciseId - ID del ejercicio a obtener
 * @returns {Promise} Promesa que resuelve con los datos del ejercicio
 */
export const getExercise = (exerciseId) => crud.get(`/${RESOURCE}/${exerciseId}`)

/**
 * Actualiza un ejercicio existente
 * @param {string} exerciseId - ID del ejercicio a actualizar
 * @param {Object} payload - Los datos del ejercicio a actualizar
 * @param {string} [payload.title] - Título del ejercicio
 * @param {string} [payload.description] - Descripción del ejercicio
 * @param {string} [payload.content] - Contenido del ejercicio
 * @param {string} [payload.difficulty] - Dificultad del ejercicio
 * @param {string} [payload.topic] - Tema del ejercicio
 * @param {Array} [payload.tags] - Etiquetas del ejercicio
 * @param {Object} [payload.solution] - Solución del ejercicio
 * @returns {Promise} Promesa que resuelve con los datos del ejercicio actualizado
 */
export const updateExercise = (exerciseId, payload) => crud.put(`/${RESOURCE}/${exerciseId}`, payload)

/**
 * Elimina un ejercicio
 * @param {string} exerciseId - ID del ejercicio a eliminar
 * @returns {Promise} Promesa que resuelve con confirmación de eliminación
 */
export const deleteExercise = (exerciseId) => crud.delete(`/${RESOURCE}/${exerciseId}`)