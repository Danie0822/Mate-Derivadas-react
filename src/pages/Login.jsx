import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import { useAuthActions } from '../hooks/useAuth';
import { Button, Input, Card, CardContent, CardHeader } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { login, isLoading, error, clearError } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: 'ale@gmail.com',
      password: 'Clave123!',
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando se monta el componente
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  // Función para llenar el formulario con datos de ejemplo
  const fillExampleData = () => {
    setValue('email', 'ale@gmail.com');
    setValue('password', 'Clave123!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa a tu cuenta de Mate Derivadas
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Bienvenido de vuelta
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                showPassword={true}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillExampleData}
                  className="w-full"
                >
                  Llenar con datos de ejemplo
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Datos de prueba
                  </span>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <p><strong>Email:</strong> ale@gmail.com</p>
                <p><strong>Contraseña:</strong> Clave123!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
