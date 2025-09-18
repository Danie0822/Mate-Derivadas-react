// services/python/pdf-upload.service.js
import { pythonCrud } from '../api'

const RESOURCE = 'pdf-upload'

/**
 * Sube un archivo PDF para procesamiento y almacenamiento en embeddings
 * @param {Object} payload - Datos para subida de PDF
 * @param {File} payload.file - Archivo PDF a subir
 * @param {string} [payload.document_type="knowledge_base"] - Tipo de documento (knowledge_base, textbook, exercise, etc.)
 * @returns {Promise} Promesa que resuelve con información de la subida y procesamiento
 * @example
 * const formData = new FormData()
 * formData.append('file', pdfFile)
 * formData.append('document_type', 'textbook')
 * 
 * const uploadResult = await uploadPDF(formData)
 * // Retorna: { 
 * //   success: true, 
 * //   message: "PDF uploaded successfully...", 
 * //   document_id: "uuid-123", 
 * //   metadata: { pages: 10, size: "2MB" }, 
 * //   chunks_processed: 0 
 * // }
 */
export const uploadPDF = (formData) => {
  return pythonCrud.postFile(`/${RESOURCE}/upload`, formData)
}

/**
 * Obtiene el estado de procesamiento de un documento
 * @param {string} documentId - ID del documento a consultar
 * @returns {Promise} Promesa que resuelve con el estado del procesamiento
 * @example
 * const status = await getProcessingStatus("uuid-123")
 * // Retorna: { 
 * //   status: "processing", 
 * //   progress: 0.65, 
 * //   message: "Processed 13/20 chunks", 
 * //   chunks_total: 20, 
 * //   chunks_processed: 13 
 * // }
 * // 
 * // Estados posibles: "processing", "completed", "failed"
 */
export const getProcessingStatus = (documentId) => pythonCrud.get(`/${RESOURCE}/status/${documentId}`)

/**
 * Elimina un documento procesado y sus embeddings de la base de datos
 * @param {string} documentId - ID del documento a eliminar
 * @returns {Promise} Promesa que resuelve con confirmación de eliminación
 * @example
 * const deleteResult = await deleteDocument("uuid-123")
 * // Retorna: { 
 * //   success: true, 
 * //   message: "Document uuid-123 deleted successfully" 
 * // }
 */
export const deleteDocument = (documentId) => pythonCrud.delete(`/${RESOURCE}/document/${documentId}`)

/**
 * Helper para crear FormData para subida de PDF
 * @param {File} file - Archivo PDF
 * @param {string} [documentType="knowledge_base"] - Tipo de documento
 * @returns {FormData} FormData preparado para la subida
 * @example
 * const file = event.target.files[0]
 * const formData = createPDFFormData(file, "textbook")
 * const result = await uploadPDF(formData)
 */
export const createPDFFormData = (file, documentType = "knowledge_base") => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  return formData
}

/**
 * Sube un PDF y monitorea su procesamiento hasta completarse
 * @param {File} file - Archivo PDF
 * @param {string} [documentType="knowledge_base"] - Tipo de documento
 * @param {Function} [onProgress] - Callback para recibir actualizaciones de progreso
 * @returns {Promise} Promesa que resuelve cuando el procesamiento se complete
 * @example
 * const result = await uploadAndProcessPDF(
 *   pdfFile, 
 *   "textbook",
 *   (progress) => console.log(`Progreso: ${progress.progress * 100}%`)
 * )
 * // Retorna el resultado final del procesamiento
 */
export const uploadAndProcessPDF = async (file, documentType = "knowledge_base", onProgress) => {
  // Subir el archivo
  const formData = createPDFFormData(file, documentType)
  const uploadResult = await uploadPDF(formData)
  
  if (!uploadResult.success) {
    throw new Error(uploadResult.message || 'Error uploading PDF')
  }
  
  const documentId = uploadResult.document_id
  
  // Monitorear el progreso
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await getProcessingStatus(documentId)
        
        if (onProgress) {
          onProgress(status)
        }
        
        if (status.status === 'completed') {
          resolve(status)
        } else if (status.status === 'failed') {
          reject(new Error(status.message || 'Processing failed'))
        } else {
          // Continuar monitoreando
          setTimeout(checkStatus, 2000) // Check every 2 seconds
        }
      } catch (error) {
        reject(error)
      }
    }
    
    // Iniciar monitoreo
    setTimeout(checkStatus, 1000) // Initial delay of 1 second
  })
}