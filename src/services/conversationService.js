import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ConversationService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/conversations`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación si existe
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Obtener conversaciones del usuario usando el endpoint de ai-questions
   * @param {string} userId - ID del usuario
   * @returns {Promise} - Lista de conversaciones
   */
  async getUserConversations(userId) {
    try {
      // Cambiar a usar el endpoint de ai-questions que ya funciona
      const response = await axios.get(`${API_BASE_URL}/ai-questions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de una conversación específica
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise} - Historial de la conversación
   */
  async getConversation(conversationId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-questions/conversation/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Crear nueva conversación
   * @param {Object} conversationData - Datos de la conversación
   * @returns {Promise} - Conversación creada
   */
  async createConversation(conversationData) {
    const response = await this.api.post('/', conversationData);
    return response.data;
  }

  /**
   * Actualizar conversación
   * @param {string} conversationId - ID de la conversación
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise} - Conversación actualizada
   */
  async updateConversation(conversationId, updateData) {
    const response = await this.api.put(`/${conversationId}`, updateData);
    return response.data;
  }

  /**
   * Eliminar conversación
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise} - Resultado de la eliminación
   */
  async deleteConversation(conversationId) {
    const response = await this.api.delete(`/${conversationId}`);
    return response.data;
  }

  /**
   * Generar nombre automático para conversación
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise} - Conversación con nombre generado
   */
  async generateConversationName(conversationId) {
    const response = await this.api.post(`/${conversationId}/generate-name`);
    return response.data;
  }



  /**
   * Marcar/desmarcar conversación como favorita
   * @param {string} conversationId - ID de la conversación
   * @param {boolean} isFavorite - Si es favorita o no
   * @returns {Promise} - Conversación actualizada
   */
  async toggleFavorite(conversationId, isFavorite) {
    return this.updateConversation(conversationId, { is_favorite: isFavorite });
  }

  /**
   * Renombrar conversación
   * @param {string} conversationId - ID de la conversación
   * @param {string} newName - Nuevo nombre
   * @returns {Promise} - Conversación actualizada
   */
  async renameConversation(conversationId, newName) {
    return this.updateConversation(conversationId, { name: newName });
  }
}

// Crear instancia singleton
const conversationService = new ConversationService();

export default conversationService;