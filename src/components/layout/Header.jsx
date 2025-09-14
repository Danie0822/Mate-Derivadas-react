import { useAuth } from '../../context/AuthContext';
import { useAuthActions } from '../../hooks/useAuth';
import { Button } from '../ui';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Mate Derivadas
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Bienvenido, <span className="font-medium">{user?.full_name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
