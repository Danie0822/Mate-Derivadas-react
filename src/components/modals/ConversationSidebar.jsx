import { useState } from 'react';
import { Card, CardContent, CardHeader, Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import conversationService from '../../services/conversationService';

export default function ConversationSidebar({ 
  conversations: propConversations,
  currentConversation, 
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateConversation,
  isOpen,
  onToggle,
  className = "" 
}) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');


  // Usar conversaciones pasadas por props o estado interno
  const conversations = Array.isArray(propConversations) ? propConversations : [];
  
  // Debug log para verificar las props
  console.log('🔍 ConversationSidebar props:', {
    propConversations,
    conversations: conversations.length,
    currentConversation,
    onSelectConversation: typeof onSelectConversation
  });

  // Calcular estadísticas localmente
  const stats = {
    total_conversations: conversations.length,
    total_messages: conversations.reduce((sum, conv) => sum + (conv.message_count || 0), 0),
    favorite_conversations: conversations.filter(conv => conv.is_favorite).length
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await onDeleteConversation(conversationId);
      loadStats(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error al eliminar la conversación');
    }
  };

  const handleToggleFavorite = async (conversationId, isFavorite, event) => {
    event.stopPropagation();
    
    try {
      await onUpdateConversation(conversationId, { is_favorite: !isFavorite });
      loadStats(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleStartEdit = (conversation, event) => {
    event.stopPropagation();
    setEditingId(conversation.id);
    setEditingName(conversation.name || `Conversación ${conversation.id.slice(0, 8)}`);
  };

  const handleSaveEdit = async (conversationId) => {
    if (!editingName.trim()) return;

    try {
      await onUpdateConversation(conversationId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      alert('Error al renombrar la conversación');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getConversationDisplayName = (conversation) => {
    if (conversation.name) {
      return conversation.name;
    }
    if (conversation.first_message) {
      return conversation.first_message.length > 30 
        ? conversation.first_message.substring(0, 30) + '...'
        : conversation.first_message;
    }
    return `Conversación ${conversation.id.slice(0, 8)}`;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header con estadísticas */}
      

      {/* Controles */}
      <div className="p-4 border-b space-y-3">
        <Button 
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white"
        >
          + Nueva Conversación
        </Button>

        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Solo favoritas</span>
        </label>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>{searchTerm || showFavoritesOnly 
              ? 'No se encontraron conversaciones' 
              : 'No hay conversaciones aún'}</p>
            {!searchTerm && !showFavoritesOnly && (
              <button
                onClick={onNewConversation}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Iniciar primera conversación
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  currentConversation?.id === conversation.id
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(conversation.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleSaveEdit(conversation.id)}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {getConversationDisplayName(conversation)}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {conversation.message_count} mensaje{conversation.message_count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(conversation.updated_at)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {editingId !== conversation.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleFavorite(conversation.id, conversation.is_favorite, e)}
                        className={`p-1 rounded hover:bg-gray-200 ${
                          conversation.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        title={conversation.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        ★
                      </button>
                      <button
                        onClick={(e) => handleStartEdit(conversation, e)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400"
                        title="Renombrar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}