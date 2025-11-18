import { crud } from './api';

export const chatService = {
  // Hacer una pregunta al AI
  askQuestion: async (data) => {
    try {
      const response = await crud.post('/ai-questions/ask', {
        ...data,
        is_chat_ia: true // Siempre marcar como chat IA
      });
      return response;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  },

  // Obtener conversaciones de chat del usuario
  getUserChatConversations: async (userId) => {
    try {
      const response = await crud.get(`/ai-questions/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  },

  // Actualizar nombre del chat
  updateChatName: async (conversationId, name) => {
    try {
      const response = await crud.put(`/conversations/${conversationId}/name`, { name });
      return response;
    } catch (error) {
      console.error('Error updating chat name:', error);
      throw error;
    }
  },

  // Alternar favorito
  toggleFavorite: async (conversationId, isFavorite) => {
    try {
      const response = await crud.put(`/conversations/${conversationId}/favorite`, { 
        is_favorite: isFavorite 
      });
      return response;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Eliminar conversación
  deleteChat: async (conversationId) => {
    try {
      const response = await crud.delete(`/conversations/${conversationId}`);
      return response;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },

  // Obtener historial de una conversación específica
  getChatHistory: async (conversationId) => {
    try {
      const response = await crud.get(`/ai-questions/conversation/${conversationId}/history`);
      return response;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
};

export default chatService;