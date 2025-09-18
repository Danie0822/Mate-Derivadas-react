// services/study-guides.service.js
import { crud } from '../api'

const RESOURCE = 'study-guides'

/**
 * Crea una nueva guía de estudio
 * @param {Object} payload - Los datos de la guía de estudio
 * @param {string} payload.title - Título de la guía de estudio
 * @param {string} payload.description - Descripción de la guía de estudio
 * @param {string} payload.content - Contenido de la guía (puede ser HTML/Markdown)
 * @param {string} [payload.topic] - Tema de la guía de estudio
 * @param {Array} [payload.tags] - Etiquetas de la guía
 * @param {string} [payload.level] - Nivel de la guía (beginner, intermediate, advanced)
 * @param {Array} [payload.exercises] - IDs de ejercicios relacionados
 * @returns {Promise} Promesa que resuelve con los datos de la guía creada
 */
export const createStudyGuide = (payload) => crud.post(`/${RESOURCE}`, payload)

/**
 * Obtiene todas las guías de estudio
 * @returns {Promise} Promesa que resuelve con la lista de todas las guías de estudio
 */
export const getStudyGuides = () => crud.get(`/${RESOURCE}`)

/**
 * Obtiene una guía de estudio por su ID
 * @param {string} studyGuideId - ID de la guía de estudio a obtener
 * @returns {Promise} Promesa que resuelve con los datos de la guía de estudio
 */
export const getStudyGuide = (studyGuideId) => crud.get(`/${RESOURCE}/${studyGuideId}`)

/**
 * Actualiza una guía de estudio existente
 * @param {string} studyGuideId - ID de la guía de estudio a actualizar
 * @param {Object} payload - Los datos de la guía de estudio a actualizar
 * @param {string} [payload.title] - Título de la guía de estudio
 * @param {string} [payload.description] - Descripción de la guía de estudio
 * @param {string} [payload.content] - Contenido de la guía
 * @param {string} [payload.topic] - Tema de la guía de estudio
 * @param {Array} [payload.tags] - Etiquetas de la guía
 * @param {string} [payload.level] - Nivel de la guía
 * @param {Array} [payload.exercises] - IDs de ejercicios relacionados
 * @returns {Promise} Promesa que resuelve con los datos de la guía actualizada
 */
export const updateStudyGuide = (studyGuideId, payload) => crud.put(`/${RESOURCE}/${studyGuideId}`, payload)

/**
 * Elimina una guía de estudio
 * @param {string} studyGuideId - ID de la guía de estudio a eliminar
 * @returns {Promise} Promesa que resuelve con confirmación de eliminación
 */
export const deleteStudyGuide = (studyGuideId) => crud.delete(`/${RESOURCE}/${studyGuideId}`)