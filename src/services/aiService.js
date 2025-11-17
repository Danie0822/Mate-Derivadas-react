import { nodeApi } from './api';

class AIService {
  /**
   * Send a chat message to the AI
   * @param {Object} payload - Chat payload
   * @param {string} payload.query - User question
   * @param {boolean} payload.use_context - Whether to use context
   * @param {string} payload.role - AI role (defaults to teacher)
   * @param {number} payload.max_context_docs - Max context documents
   * @param {number} payload.similarity_threshold - Similarity threshold
   * @returns {Promise<Object>} AI response
   */
  async chat(payload) {
    try {
      // Get current user from localStorage or context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        throw new Error('User not authenticated');
      }

      // Transform payload to match backend API
      const requestPayload = {
        user_id: user.id,
        question: payload.query
      };

      console.log('🤖 Sending chat request:', requestPayload);

      const response = await nodeApi.post('/ai-questions/ask', requestPayload);

      console.log('✅ Chat response received:', response.data);

      // Transform response to match frontend expectations
      if (response.data.success && response.data.data) {
        return {
          response: response.data.data.answer,
          query: response.data.data.question,
          model: 'mate-derivadas-ai',
          role: payload.role || 'teacher',
          role_name: 'Profesor de Derivadas',
          context_used: payload.use_context || false,
          documents_count: 0, // Backend doesn't return this yet
          success: true
        };
      } else {
        throw new Error(response.data.message || 'Error generating AI response');
      }

    } catch (error) {
      console.error('❌ AI Service Error:', error);
      
      if (error.response) {
        // Server responded with error status
        throw new Error(
          error.response.data?.message || 
          `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        // Request made but no response received
        throw new Error('No response from server. Check your connection.');
      } else {
        // Other error
        throw new Error(error.message || 'Unknown error occurred');
      }
    }
  }

  /**
   * Start a new conversation
   * @param {string} name - Conversation name (optional)
   * @returns {Promise<Object>} New conversation object
   */
  async startNewConversation(name = null) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        throw new Error('User not authenticated');
      }

      const payload = {
        user_id: user.id,
        name: name
      };

      const response = await nodeApi.post('/conversations', payload);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error starting new conversation:', error);
      throw error;
    }
  }

  /**
   * Get user's conversation history
   * @param {string} userId - User ID (optional, will use current user if not provided)
   * @returns {Promise<Array>} Array of conversations
   */
  async getConversations(userId = null) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const targetUserId = userId || user.id;
      
      console.log('🔍 Getting conversations for user:', targetUserId);
      
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      console.log('📞 Making API call to:', `/conversations/user/${targetUserId}`);
      const response = await nodeApi.get(`/conversations/user/${targetUserId}`);
      
      console.log('📥 API Response:', response.data);
      const conversations = response.data.data || [];
      console.log('✅ Processed conversations:', conversations);
      
      return conversations;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      return [];
    }
  }

  /**
   * Get conversation messages
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Array of messages
   */
  async getConversationMessages(conversationId) {
    try {
      console.log('🔍 Fetching messages for conversation:', conversationId);
      const response = await nodeApi.get(`/ai-questions/conversation/${conversationId}`);
      console.log('📥 Backend response:', response.data);
      
      // El backend devuelve { conversation, messages }
      if (response.data.success && response.data.data) {
        return response.data.data.messages || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching conversation messages:', error);
      return [];
    }
  }

  /**
   * Delete a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteConversation(conversationId) {
    try {
      await nodeApi.delete(`/conversations/${conversationId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Update conversation (name, favorite status)
   * @param {string} conversationId - Conversation ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated conversation
   */
  async updateConversation(conversationId, updates) {
    try {
      const response = await nodeApi.put(`/conversations/${conversationId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      throw error;
    }
  }
}

const aiService = new AIService();
export default aiService;