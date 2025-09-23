import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Search } from '../ui';

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V6H5v12h7v2H4a1 1 0 01-1-1V4z M15 10a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z',
      path: '/dashboard',
      tags: ['inicio', 'panel', 'resumen', 'home', 'principal']
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      path: '/users',
      tags: ['usuarios', 'gestión', 'administración', 'personas', 'cuentas', 'perfiles']
    },
    {
      id: 'exercises',
      title: 'Ejercicios',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/exercises',
      tags: ['ejercicios', 'problemas', 'práctica', 'matemáticas', 'derivadas', 'actividades']
    },
    {
      id: 'study-guides',
      title: 'Guías de Estudio',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      path: '/study-guides',
      tags: ['guías', 'estudio', 'materiales', 'recursos', 'aprendizaje', 'teoría', 'contenido']
    },
    {
      id: 'ai-chat',
      title: 'Chat IA',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      path: '/ai-chat',
      tags: ['chat', 'ia', 'inteligencia artificial', 'asistente', 'conversación', 'ayuda', 'preguntas']
    },
    {
      id: 'calculator',
      title: 'Calculadora de Derivadas',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      path: '/calculator',
      tags: ['calculadora', 'derivadas', 'cálculo', 'matemáticas', 'funciones', 'gráficos']
    },
    {
      id: 'user-progress',
      title: 'Progreso de Usuario',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      path: '/user-progress',
      tags: ['progreso', 'estadísticas', 'avance', 'rendimiento', 'métricas', 'seguimiento']
    },
    {
      id: 'pdf-upload',
      title: 'Subir PDFs',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
      path: '/pdf-upload',
      tags: ['pdf', 'subir', 'archivos', 'documentos', 'cargar', 'upload', 'materiales']
    },
    {
      id: 'embeddings',
      title: 'Gestión de Embeddings',
      icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
      path: '/embeddings',
      tags: ['embeddings', 'vectores', 'base de datos', 'contexto', 'búsqueda', 'similitud']
    }
  ];

  const filteredItems = menuItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-white shadow-lg border-r border-blue-100
        lg:flex lg:flex-col
        ${isOpen ? 'fixed inset-y-0 left-0 z-30' : 'hidden lg:flex'}
        transition-transform duration-300 ease-in-out
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <img
                src="/Derivium-Logo.avif"
                alt="Derivium"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-white">
                Derivium
              </h1>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Buscador */}
          <div className="p-4 border-b border-gray-200">
            <Search
              placeholder="Buscar en el menú..."
              onSearch={setSearchQuery}
              size="sm"
            />
          </div>

          {/* Lista de navegación */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-100 to-green-100 text-blue-900 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-gray-900'
                    }
                  `}
                >
                  <svg
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                      ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}
                    `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="truncate">{item.title}</span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No se encontraron resultados para "{searchQuery}"
              </div>
            )}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Versión 1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}