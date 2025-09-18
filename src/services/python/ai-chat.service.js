// services/python/ai-chat.service.js
import { pythonCrud } from '../api'

const BASE_RESOURCE = 'ai-chat'

/**
 * Obtiene todos los roles disponibles para la IA
 * @returns {Promise} Promesa que resuelve con la información de roles disponibles
 * @example
 * // Retorna: { roles: { assistant: {...}, teacher: {...} }, total_roles: 2 }
 */
export const getAvailableRoles = () => pythonCrud.get(`/${BASE_RESOURCE}/roles`)

/**
 * Realiza un chat con IA usando contexto de la base de datos vectorial
 * @param {Object} payload - Datos para el chat con IA
 * @param {string} payload.query - Pregunta o consulta para la IA
 * @param {boolean} [payload.use_context=true] - Si usar contexto de la base de datos vectorial
 * @param {number} [payload.max_context_docs=5] - Número máximo de documentos de contexto (1-10)
 * @param {number} [payload.similarity_threshold=0.7] - Umbral de similitud para documentos (0.0-1.0)
 * @param {string} [payload.custom_instructions] - Instrucciones personalizadas para la IA
 * @param {string} [payload.role="assistant"] - Rol de la IA (assistant, teacher, tutor, etc.)
 * @returns {Promise} Promesa que resuelve con la respuesta de la IA y metadatos
 * @example
 * const response = await chatWithContext({
 *   query: "¿Cómo se calcula la derivada de x²?",
 *   use_context: true,
 *   role: "teacher",
 *   max_context_docs: 3
 * })
 * // Retorna: { response: "La derivada de x²...", model: "deepseek", context_used: true, ... }
 */
export const chatWithContext = (payload) => pythonCrud.post(`/${BASE_RESOURCE}/chat`, payload)

/**
 * Realiza una consulta RAG (Retrieval-Augmented Generation)
 * @param {Object} payload - Datos para la consulta RAG
 * @param {string} payload.query - Consulta para realizar RAG
 * @param {number} [payload.context_limit=5] - Límite de documentos de contexto (1-20)
 * @param {number} [payload.similarity_threshold=0.7] - Umbral de similitud (0.0-1.0)
 * @param {number} [payload.temperature] - Temperatura para la generación (0.0-2.0)
 * @param {number} [payload.max_tokens] - Número máximo de tokens a generar
 * @param {string} [payload.role="assistant"] - Rol de la IA
 * @returns {Promise} Promesa que resuelve con respuesta RAG y documentos similares
 * @example
 * const ragResponse = await performRAGQuery({
 *   query: "Ejercicios de derivadas con soluciones",
 *   context_limit: 8,
 *   temperature: 0.3,
 *   role: "tutor"
 * })
 * // Retorna: { response: "...", similar_documents: [...], context_documents: [...] }
 */
export const performRAGQuery = (payload) => pythonCrud.post(`/${BASE_RESOURCE}/rag`, payload)

/**
 * Chat con instrucciones personalizadas
 * @param {Object} payload - Datos para chat con instrucciones personalizadas
 * @param {string} payload.query - Pregunta o consulta
 * @param {string} payload.instructions - Instrucciones específicas para la IA
 * @param {boolean} [payload.use_context=true] - Si usar contexto de la base de datos
 * @param {number} [payload.max_context_docs=5] - Número máximo de documentos de contexto
 * @param {string} [payload.role="assistant"] - Rol de la IA
 * @returns {Promise} Promesa que resuelve con respuesta personalizada
 * @example
 * const customResponse = await customInstructionChat({
 *   query: "Explica las derivadas",
 *   instructions: "Responde como si fueras un profesor de secundaria, usa ejemplos simples",
 *   role: "teacher"
 * })
 */
export const customInstructionChat = (payload) => pythonCrud.post(`/${BASE_RESOURCE}/custom-instruction`, payload)

/**
 * Obtiene el estado de los servicios de IA
 * @returns {Promise} Promesa que resuelve con información del estado de la IA
 * @example
 * // Retorna: { openroute_status: {...}, deepseek_model: "...", document_count: 150, available_roles: [...] }
 */
export const getAIStatus = () => pythonCrud.get(`/${BASE_RESOURCE}/status`)

/**
 * Obtiene información sobre los modelos disponibles
 * @returns {Promise} Promesa que resuelve con información de modelos
 * @example
 * // Retorna: { current_model: "deepseek-chat", models: [...], success: true }
 */
export const getModelsInfo = () => pythonCrud.get(`/${BASE_RESOURCE}/models`)

// Servicios para AI Chat New (mismos endpoints pero con ruta diferente)
const NEW_BASE_RESOURCE = 'ai-chat-new'

/**
 * [NUEVA VERSIÓN] Obtiene todos los roles disponibles para la IA
 * @returns {Promise} Promesa que resuelve con la información de roles disponibles
 */
export const getAvailableRolesNew = () => pythonCrud.get(`/${NEW_BASE_RESOURCE}/roles`)

/**
 * [NUEVA VERSIÓN] Realiza un chat con IA usando contexto de la base de datos vectorial
 * @param {Object} payload - Misma estructura que chatWithContext
 * @returns {Promise} Promesa que resuelve con la respuesta de la IA
 */
export const chatWithContextNew = (payload) => pythonCrud.post(`/${NEW_BASE_RESOURCE}/chat`, payload)

/**
 * [NUEVA VERSIÓN] Realiza una consulta RAG
 * @param {Object} payload - Misma estructura que performRAGQuery
 * @returns {Promise} Promesa que resuelve con respuesta RAG
 */
export const performRAGQueryNew = (payload) => pythonCrud.post(`/${NEW_BASE_RESOURCE}/rag`, payload)

/**
 * [NUEVA VERSIÓN] Chat con instrucciones personalizadas
 * @param {Object} payload - Misma estructura que customInstructionChat
 * @returns {Promise} Promesa que resuelve con respuesta personalizada
 */
export const customInstructionChatNew = (payload) => pythonCrud.post(`/${NEW_BASE_RESOURCE}/custom-instruction`, payload)

/**
 * [NUEVA VERSIÓN] Obtiene el estado de los servicios de IA
 * @returns {Promise} Promesa que resuelve con información del estado
 */
export const getAIStatusNew = () => pythonCrud.get(`/${NEW_BASE_RESOURCE}/status`)

/**
 * [NUEVA VERSIÓN] Obtiene información sobre los modelos disponibles
 * @returns {Promise} Promesa que resuelve con información de modelos
 */
export const getModelsInfoNew = () => pythonCrud.get(`/${NEW_BASE_RESOURCE}/models`)