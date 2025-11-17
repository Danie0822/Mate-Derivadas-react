import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button, Search } from '../components/ui';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '¡Hola! Soy tu asistente de matemáticas. Puedo ayudarte con derivadas, integrales y conceptos de cálculo. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Esta es una respuesta simulada para: "${inputMessage}". Aquí explicaría conceptos de derivadas basándome en el contexto de la base de datos vectorial.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
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
          {/* Panel lateral con información */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 border-b border-blue-200/50">
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Roles Disponibles
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRole === role.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-100 to-green-100'
                          : 'border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="font-medium text-sm">{role.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200/50">
                <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Preguntas Rápidas
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded border border-green-200 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat principal */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/20">
              {/* Área de mensajes */}
              <CardContent className="flex-1 p-0">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                              : 'bg-gradient-to-r from-gray-100 to-blue-50 text-gray-900 border border-blue-200/50'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gradient-to-r from-gray-100 to-blue-50 text-gray-900 px-4 py-2 rounded-lg shadow-sm border border-blue-200/50">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">Escribiendo...</span>
                          </div>
                        </div>
                      </div>
                    )}
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
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}