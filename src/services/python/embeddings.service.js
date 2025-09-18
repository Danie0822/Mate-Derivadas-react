// services/python/embeddings.service.js
import { pythonCrud } from '../api'

const RESOURCE = 'embeddings'

/**
 * Genera embedding para un texto dado
 * @param {Object} payload - Datos para generar embedding
 * @param {string} payload.text - Texto para el cual generar embedding
 * @param {boolean} [payload.normalize=true] - Si normalizar el vector embedding
 * @returns {Promise} Promesa que resuelve con el embedding generado
 * @example
 * const embedding = await generateEmbedding({
 *   text: "¿Cómo se calcula la derivada de una función?",
 *   normalize: true
 * })
 * // Retorna: { embedding: [0.123, -0.456, ...], dimension: 384, model: "all-MiniLM-L6-v2" }
 */
export const generateEmbedding = (payload) => pythonCrud.post(`/${RESOURCE}/generate`, payload)

/**
 * Busca documentos similares en la base de datos vectorial
 * @param {Object} payload - Datos para búsqueda de similitud
 * @param {string} payload.query - Consulta para buscar documentos similares
 * @param {number} [payload.limit=5] - Número máximo de resultados (1-50)
 * @param {number} [payload.threshold=0.7] - Umbral de similitud mínimo (0.0-1.0)
 * @returns {Promise} Promesa que resuelve con documentos similares encontrados
 * @example
 * const similarDocs = await searchSimilarDocuments({
 *   query: "ejercicios de derivadas",
 *   limit: 10,
 *   threshold: 0.8
 * })
 * // Retorna: { results: [{ content: "...", similarity: 0.85, metadata: {...} }], query: "...", total_found: 3 }
 */
export const searchSimilarDocuments = (payload) => pythonCrud.post(`/${RESOURCE}/search`, payload)

/**
 * Obtiene estadísticas del servicio de embeddings y base de datos
 * @returns {Promise} Promesa que resuelve con estadísticas del sistema
 * @example
 * // Retorna: { 
 * //   model_name: "all-MiniLM-L6-v2", 
 * //   embedding_dimension: 384, 
 * //   total_documents: 150, 
 * //   vector_table: "embeddings", 
 * //   supabase_configured: true 
 * // }
 */
export const getEmbeddingStats = () => pythonCrud.get(`/${RESOURCE}/stats`)

/**
 * Genera embeddings para múltiples textos en lote
 * @param {string[]} texts - Array de textos para generar embeddings (máximo 50)
 * @returns {Promise} Promesa que resuelve con embeddings para todos los textos
 * @example
 * const batchEmbeddings = await generateBatchEmbeddings([
 *   "Primera función matemática",
 *   "Segunda función matemática", 
 *   "Tercera función matemática"
 * ])
 * // Retorna: [
 * //   { embedding: [...], dimension: 384, model: "..." },
 * //   { embedding: [...], dimension: 384, model: "..." },
 * //   { embedding: [...], dimension: 384, model: "..." }
 * // ]
 */
export const generateBatchEmbeddings = (texts) => pythonCrud.post(`/${RESOURCE}/batch`, texts)