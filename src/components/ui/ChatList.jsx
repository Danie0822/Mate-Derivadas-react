import { useState } from 'react';
import { Card, CardContent, CardHeader, Button } from '../ui';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaComments } from 'react-icons/fa';

const ChatList = ({ 
  conversations = [], 
  onSelectChat, 
  onUpdateChatName, 
  onToggleFavorite, 
  onDeleteChat,
  selectedChatId,
  onNewChat 
}) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleStartEdit = (chat) => {
    setEditingChatId(chat.id);
    setEditingName(chat.name || 'Nueva Conversación');
  };

  const handleSaveEdit = async () => {
    if (editingName.trim() && editingChatId) {
      await onUpdateChatName(editingChatId, editingName.trim());
      setEditingChatId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingName('');
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteModal) {
      await onDeleteChat(showDeleteModal);
      setShowDeleteModal(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 border-b border-blue-200/50">
          <div className="flex items-center justify-between">
            <Button
              onClick={onNewChat}
              className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg text-sm py-1 px-3 w-fit"
            >
              + Nuevo Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <div className="space-y-2 p-4 max-h-[500px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FaComments className="mx-auto text-4xl text-gray-300 mb-2" />
                <p>No hay conversaciones aún</p>
                <p className="text-sm">¡Inicia tu primera conversación!</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedChatId === chat.id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-100 to-green-100 shadow-md'
                      : 'border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50'
                  }`}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit();
                              }}
                              className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {chat.name || 'Nueva Conversación'}
                            </h4>
                            {chat.is_favorite && (
                              <FaHeart className="text-red-500 text-xs flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(chat.updated_at)}
                          </p>
                        </>
                      )}
                    </div>

                    {editingChatId !== chat.id && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(chat.id, !chat.is_favorite);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title={chat.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                          {chat.is_favorite ? (
                            <FaHeart className="text-xs" />
                          ) : (
                            <FaRegHeart className="text-xs" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(chat);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Editar nombre"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteModal(chat.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar conversación"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Eliminar Conversación
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatList;