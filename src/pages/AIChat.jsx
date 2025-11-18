import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button, ChatList } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Componente para renderizar contenido con LaTeX
const MathContent = ({ content }) => {
  const renderContent = (text) => {
    const parts = [];
    let lastIndex = 0;
    
    // Expresiones en bloque $$...$$
    const blockMatches = [...text.matchAll(/\$\$([^$]+?)\$\$/g)];
    
    // Expresiones inline $...$
    const inlineMatches = [...text.matchAll(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g)];
    
    // Combinar y ordenar todas las coincidencias
    const allMatches = [...blockMatches, ...inlineMatches].sort((a, b) => a.index - b.index);
    
    allMatches.forEach((match, index) => {
      // Agregar texto antes de la expresión matemática
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      // Agregar la expresión matemática
      const isBlock = match[0].startsWith('$$');
      const mathContent = match[1];
      
      try {
        if (isBlock) {
          parts.push(
            <BlockMath key={`math-${index}`} math={mathContent} />
          );
        } else {
          parts.push(
            <InlineMath key={`math-${index}`} math={mathContent} />
          );
        }
      } catch (error) {
        // Si hay error en el LaTeX, mostrar el texto original
        parts.push(
          <span key={`error-${index}`} className="text-red-500 bg-red-50 px-1 rounded">
            {match[0]}
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    });
    
    // Agregar el texto restante
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? parts : [text];
  };
  
  return (
    <div className="math-content">
      {renderContent(content)}
    </div>
  );
};

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const roles = [
    { id: 'assistant', name: 'Asistente General', description: 'Ayuda general con matemáticas' },
    { id: 'teacher', name: 'Profesor', description: 'Explicaciones detalladas y pedagógicas' },
    { id: 'tutor', name: 'Tutor', description: 'Guía paso a paso para resolver problemas' }
  ];

  const [selectedRole, setSelectedRole] = useState('assistant');

  const quickQuestions = [
    '¿Cómo calculo la derivada de x²?',
    'Explícame la regla de la cadena',
    '¿Qué es una derivada?',
    'Ayúdame con derivadas trigonométricas',
    'Ejercicios de derivadas implícitas'
  ];

  const loadUserConversations = useCallback(async () => {
    try {
      const userConversations = await chatService.getUserChatConversations(user.id);
      setConversations(userConversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  }, [user.id]);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadUserConversations();
    }
  }, [user?.id, loadUserConversations]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const question = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const requestData = {
        user_id: user.id,
        question: question,
        is_chat_ia: true
      };
      
      // Solo incluir conversation_id si no es null
      if (currentConversationId) {
        requestData.conversation_id = currentConversationId;
      }
      
      const response = await chatService.askQuestion(requestData);

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Si es la primera pregunta de una nueva conversación, actualizar el ID
      if (!currentConversationId && response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
        // Recargar conversaciones para mostrar la nueva
        await loadUserConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleSelectChat = async (conversation) => {
    setCurrentConversationId(conversation.id);
    setIsLoading(true);
    
    try {
      // Cargar el historial de la conversación
      const historyResponse = await chatService.getChatHistory(conversation.id);
      
      if (historyResponse && historyResponse.messages) {
        // Convertir el historial a formato de mensajes del frontend
        const historyMessages = historyResponse.messages.flatMap((msg) => [
          {
            id: `${msg.id}-question`,
            type: 'user',
            content: msg.question,
            timestamp: new Date(msg.created_at)
          },
          {
            id: `${msg.id}-answer`,
            type: 'ai',
            content: msg.answer,
            timestamp: new Date(msg.created_at)
          }
        ]);
        
        setMessages(historyMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleUpdateChatName = async (conversationId, name) => {
    try {
      await chatService.updateChatName(conversationId, name);
      await loadUserConversations(); // Recargar lista
    } catch (error) {
      console.error('Error updating chat name:', error);
    }
  };

  const handleToggleFavorite = async (conversationId, isFavorite) => {
    try {
      await chatService.toggleFavorite(conversationId, isFavorite);
      await loadUserConversations(); // Recargar lista
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteChat = async (conversationId) => {
    try {
      await chatService.deleteChat(conversationId);
      // Si se elimina la conversación actual, crear un nuevo chat
      if (conversationId === currentConversationId) {
        handleNewChat();
      }
      await loadUserConversations(); // Recargar lista
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Chat con IA
            </h1>
            <p className="mt-2 text-gray-700">
              Asistente inteligente para ayudarte con matemáticas
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <span className="text-sm text-gray-500">Rol:</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel lateral con lista de conversaciones */}
          <div className="lg:col-span-1">
            <ChatList
              conversations={conversations}
              onSelectChat={handleSelectChat}
              onUpdateChatName={handleUpdateChatName}
              onToggleFavorite={handleToggleFavorite}
              onDeleteChat={handleDeleteChat}
              selectedChatId={currentConversationId}
              onNewChat={handleNewChat}
            />
          </div>

          {/* Chat principal */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/20">
              {messages.length === 0 ? (
                /* Pantalla de inicio */
                <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center max-w-2xl">
                    <div className="mb-8">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
                        ¡Hola! Soy tu asistente de matemáticas
                      </h2>
                      <p className="text-lg text-gray-600 mb-8">
                        Puedo ayudarte con derivadas, integrales y conceptos de cálculo. Selecciona una pregunta para empezar o escribe la tuya propia.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="p-4 text-left bg-gradient-to-r from-white to-blue-50/50 border border-blue-200 rounded-xl hover:shadow-md hover:from-blue-50 hover:to-green-50 transition-all duration-300 group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                            <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                              {question}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input de mensaje para pantalla de inicio */}
                  <div className="w-full max-w-3xl">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="¿En qué puedo ayudarte hoy? Escribe tu pregunta sobre matemáticas..."
                        className="flex-1 px-6 py-4 border border-blue-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        isLoading={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg rounded-xl text-lg font-medium"
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                /* Chat activo */
                <CardContent className="flex-1 p-0">
                  <div className="h-full flex flex-col">
                    {/* Área de mensajes con scroll mejorado */}
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto p-4 space-y-4 max-h-[580px]">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                message.type === 'user'
                                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                                  : 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-900 border border-blue-200/50'
                              }`}
                            >
                              <div className="text-sm leading-relaxed">
                                {message.type === 'ai' ? (
                                  <MathContent content={message.content} />
                                ) : (
                                  <div className="whitespace-pre-wrap">{message.content}</div>
                                )}
                              </div>
                              <div className={`text-xs mt-2 ${
                                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 text-gray-900 px-4 py-3 rounded-2xl shadow-sm border border-blue-200/50">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Escribiendo...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input de mensaje */}
                    <div className="border-t border-blue-200/50 p-4 bg-gradient-to-r from-blue-50/50 to-green-50/50">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Escribe tu pregunta sobre matemáticas..."
                          className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={isLoading}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          isLoading={isLoading}
                          className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg"
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}