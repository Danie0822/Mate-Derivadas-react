import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { askAIQuestion, getUserConversations, getConversationHistory } from '../services/node/ai-questions.service';
import conversationService from '../services/conversationService';
import ConversationSidebar from '../components/modals/ConversationSidebar';

export default function AIChat() {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Estados del chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de conversaciones
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const roles = [
    { id: 'teacher', name: 'Profesor de Derivadas', description: 'Especialista en enseñanza de derivadas matemáticas' }
  ];

  const [selectedRole, setSelectedRole] = useState('teacher');

  const quickQuestions = [
    '¿Cómo calculo la derivada de x²?',
    'Explícame la regla de la cadena',
    '¿Qué es una derivada?',
    'Ayúdame con derivadas trigonométricas',
    'Ejercicios de derivadas implícitas'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 5);
  };

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      console.warn('🚨 No user ID found, cannot load conversations');
      return;
    }
    
    console.log('🔄 Loading conversations for user:', user.id);
    
    try {
      const response = await getUserConversations(user.id);
      console.log('✅ Raw API Response:', response);
      console.log('✅ Response data field:', response.data);
      
      const userConversations = response.data || [];
      console.log('✅ Final conversations to set:', userConversations);
      console.log('✅ Is array?', Array.isArray(userConversations));
      console.log('✅ Length:', userConversations.length);
      
      setConversations(userConversations);
      console.log('✅ Conversations state updated');
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      setConversations([]); // Asegurar que sea un array vacío en caso de error
    }
  }, [user?.id]);

  // Cargar conversaciones al iniciar pero no ninguna conversación por defecto
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
    // Solo mostrar mensaje de bienvenida, no cargar ninguna conversación
    startWelcomeConversation();
  }, [user?.id, loadConversations]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startWelcomeConversation = () => {
    setMessages([]);
  };

  const handleNewConversation = async () => {
    try {
      setMessages([]);
      setCurrentConversation(null);
      startWelcomeConversation();
      await loadConversations();
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setCurrentConversation(conversation);
      
      // Obtener historial de la conversación
      const response = await getConversationHistory(conversation.id);
      console.log('📥 Respuesta completa recibida:', response);
      
      // Extraer los mensajes correctamente de la estructura anidada
      const responseData = response?.data || response;
      const messages = responseData?.data?.messages || responseData?.messages || [];
      console.log('📋 Array de mensajes extraído:', messages, 'Es array?', Array.isArray(messages));
      
      // Verificar que tenemos mensajes válidos
      if (!Array.isArray(messages)) {
        console.warn('⚠️ Los mensajes no son un array válido:', messages);
        setMessages([]);
        setError('No se pudieron cargar los mensajes de la conversación');
        return;
      }
      
      // Formatear mensajes para la UI - cada AIQuestion tiene pregunta y respuesta
      const formattedMessages = [];
      
      messages.forEach(msg => {
        if (msg && msg.question && msg.answer) {
          // Agregar pregunta del usuario
          formattedMessages.push({
            id: `${msg.id}_question`,
            type: 'user',
            content: msg.question,
            timestamp: new Date(msg.created_at)
          });
          
          // Agregar respuesta de la IA
          formattedMessages.push({
            id: `${msg.id}_answer`,
            type: 'ai',
            content: msg.answer,
            timestamp: new Date(msg.created_at),
            role: 'Profesor de Derivadas'
          });
        } else {
          console.warn('⚠️ Mensaje con estructura inválida:', msg);
        }
      });

      // Ordenar por fecha
      formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
      
      console.log('✅ Mensajes formateados:', formattedMessages);
      
      // Si no hay mensajes formateados, mostrar mensaje de conversación vacía
      if (formattedMessages.length === 0) {
        console.log('📝 No hay mensajes válidos, iniciando conversación vacía');
        startWelcomeConversation();
      } else {
        setMessages(formattedMessages);
      }
      
      setError(null); // Limpiar cualquier error previo
      
    } catch (error) {
      console.error('❌ Error loading conversation messages:', error);
      setError('Error al cargar la conversación');
      // En caso de error, mostrar mensaje de bienvenida
      startWelcomeConversation();
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await conversationService.deleteConversation(conversationId);
      await loadConversations();
      
      // Si la conversación eliminada es la actual, iniciar nueva
      if (currentConversation?.id === conversationId) {
        handleNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Error al eliminar la conversación');
    }
  };

  const handleUpdateConversation = async (conversationId, updates) => {
    try {
      await conversationService.updateConversation(conversationId, updates);
      await loadConversations();
      
      // Actualizar conversación actual si es la misma
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
      setError('Error al actualizar la conversación');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Llamar al servicio de IA usando el nuevo endpoint
      const response = await askAIQuestion({
        user_id: user.id,
        question: userMessage,
        conversation_id: currentConversation?.id
      });

      console.log('🤖 AI Response:', response);

      // Verificar que la respuesta tenga la estructura correcta
      const responseData = response?.data?.data || response?.data || {};
      const conversationData = response?.data?.conversation || response?.conversation || null;

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: responseData.answer || 'Error: No se recibió respuesta',
        timestamp: new Date(responseData.created_at || new Date()),
        questionId: responseData.id
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Actualizar conversación actual si se devolvió información de conversación
      if (conversationData) {
        setCurrentConversation(conversationData);
      }
      
      // Recargar conversaciones después de enviar mensaje
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar el mensaje. Por favor, intenta nuevamente.');
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta nuevamente.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Sidebar de conversaciones */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-white shadow-lg`}>
          {/* Debug: Log conversations before passing to sidebar */}
          {console.log('🔍 AIChat passing conversations to sidebar:', conversations)}
          <ConversationSidebar
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onUpdateConversation={handleUpdateConversation}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Área principal del chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {currentConversation?.name || 'Nueva Conversación'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {user ? `Conectado como: ${user.email}` : 'Profesor de Derivadas IA'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Profesor:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gradient-to-r from-blue-50 to-green-50"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError(null)}
              >
                <span className="sr-only">Cerrar</span>
                ×
              </button>
            </div>
          )}

          {/* Chat principal */}
          <div className="flex-1 flex flex-col">
            {/* Área de mensajes */}
            <div 
              className="flex-1 max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-gradient-to-br from-blue-50/20 to-green-50/20 relative"
              onScroll={handleScroll}
            >
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">¡Comienza una nueva conversación!</h3>
                  <p className="text-gray-500 mb-6">Haz una pregunta sobre derivadas matemáticas</p>
                  
                  {/* Preguntas rápidas */}
                  <div className="max-w-2xl mx-auto">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preguntas sugeridas:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="p-3 text-sm text-left text-gray-700 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg shadow-sm break-words ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                            : message.isError
                            ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-900 border border-red-200/50'
                            : 'bg-white text-gray-900 border border-gray-200 shadow-md'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">{message.content}</div>
                        <div className={`text-xs mt-2 flex justify-between items-center ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.type === 'ai' && message.role && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {message.context_used && message.documents_count > 0 
                                ? `📚 ${message.documents_count} docs` 
                                : '🤖'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 px-4 py-3 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">El profesor está escribiendo...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
              
              {/* Botón de scroll hacia abajo */}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-10 hover:scale-110"
                  title="Ir al final"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
            </div>

            {/* Input de mensaje */}
            <div className="border-t bg-white p-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu pregunta sobre derivadas matemáticas..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg px-6"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}