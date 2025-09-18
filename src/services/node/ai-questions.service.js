// services/ai-questions.service.js
import { crud } from '../api'

const RESOURCE = 'ai-questions'

/**
 * Hace una pregunta a la IA
 * @param {Object} payload - Los datos de la pregunta para la IA
 * @param {string} payload.user_id - ID del usuario que hace la pregunta
 * @param {string} payload.question - La pregunta a realizar
 * @param {string} [payload.context] - Contexto adicional para la pregunta
 * @param {string} [payload.conversation_id] - ID de la conversación (si es parte de una conversación existente)
 * @param {string} [payload.topic] - Tema relacionado (derivadas, integrales, etc.)
 * @returns {Promise} Promesa que resuelve con la respuesta de la IA y el registro guardado
 */
export const askAIQuestion = (payload) => crud.post(`/${RESOURCE}/ask`, payload)

/**
 * Obtiene todas las conversaciones de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise} Promesa que resuelve con todas las conversaciones del usuario
 */
export const getUserConversations = (userId) => crud.get(`/${RESOURCE}/user/${userId}`)

/**
 * Obtiene todos los registros de preguntas a la IA
 * @returns {Promise} Promesa que resuelve con la lista de todas las preguntas y respuestas
 */
export const getAIQuestions = () => crud.get(`/${RESOURCE}`)

/**
 * Obtiene un registro específico de pregunta a la IA por su ID
 * @param {string} questionId - ID del registro de pregunta a obtener
 * @returns {Promise} Promesa que resuelve con los datos de la pregunta y respuesta
 */
export const getAIQuestion = (questionId) => crud.get(`/${RESOURCE}/${questionId}`)