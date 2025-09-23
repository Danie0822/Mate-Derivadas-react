import { useAuth } from '../../context/AuthContext';
import { useAuthActions } from '../../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '../ui';

export default function Header({ onMenuToggle }) {
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();

  // Configurar la mutación para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const result = await logout();
      if (!result.success) {
        throw new Error(result.error || 'Error al cerrar sesión');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Sesión cerrada correctamente. ¡Hasta pronto!', {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al cerrar sesión', {
        duration: 4000,
      });
      console.error('Error en logout:', error);
    },
  });

  const handleLogout = () => {
    // Mostrar toast de confirmación
    toast.promise(
      logoutMutation.mutateAsync(),
      {
        loading: 'Cerrando sesión...',
        success: '¡Sesión cerrada exitosamente!',
        error: 'Error al cerrar sesión',
      }
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 shadow-lg flex-shrink-0 border-b border-white/20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Botón de menú para móvil */}
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 lg:hidden mr-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 lg:hidden">
              <img
                src="/Derivium-Logo.avif"
                alt="Derivium"
                className="h-6 w-auto"
              />
              <h1 className="text-xl font-semibold text-white">
                Derivium
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/90">
              Bienvenido, <span className="font-medium text-white">{user?.full_name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              isLoading={logoutMutation.isPending}
              disabled={logoutMutation.isPending}
              className="text-white hover:bg-white/20 border-white/30"
            >
              {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
