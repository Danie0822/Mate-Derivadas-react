import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loginSchema } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import { useAuthActions } from '../hooks/useAuth';
import { Button, Input, Card, CardContent, CardHeader } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { login } = useAuthActions();
  const hasRedirected = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: 'ale@gmail.com',
      password: 'Clave123!',
    },
  });

  // Configurar la mutación para login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const result = await login(email, password);
      if (!result.success) {
        throw new Error(result.error || 'Error al iniciar sesión');
      }
      return result;
    },
    onSuccess: (data) => {
      hasRedirected.current = true; // Marcar que vamos a redirigir
      toast.success('¡Bienvenido! Sesión iniciada correctamente', {
        duration: 3000,
        position: 'top-center',
      });
      // Pequeño delay para mostrar el toast antes de redirigir
      setTimeout(() => {
        navigate({ to: '/dashboard', replace: true });
      }, 500);
    },
    onError: (error) => {
      // NO mostrar toast, solo el error en el componente
      console.error('Error en login:', error);
    },
  });

  // Redirigir si ya está autenticado SOLO al cargar la página
  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate({ to: '/dashboard', replace: true });
    }
  }, []); // Array vacío para que solo se ejecute una vez al montar

  const onSubmit = async (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-green-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <img
                src="/Derivium-Logo.avif"
                alt="Derivium"
                className="h-16 w-auto"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Bienvenido a Derivium
          </h1>
          <p className="text-blue-100 text-lg">
            Tu plataforma de aprendizaje matemático
          </p>
        </div>

        {/* Card de login */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 text-white py-6">
            <h2 className="text-2xl font-semibold text-center">
              Iniciar Sesión
            </h2>
            <p className="text-center text-blue-100 mt-1 text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  error={errors.email?.message}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  {...register('email')}
                />
              </div>

              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  showPassword={true}
                  error={errors.password?.message}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  {...register('password')}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 hover:from-blue-700 hover:via-blue-600 hover:to-green-600 text-white border-0 shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 disabled:opacity-70"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </div>

              {/* Mensaje de error persistente */}
              {loginMutation.isError && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Error al iniciar sesión
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {loginMutation.error?.message || 'Verifica tus credenciales e intenta nuevamente'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Texto inferior */}
        <p className="text-center text-white/80 text-sm mt-6">
          ¿Problemas para acceder? Contacta al administrador
        </p>
      </div>
    </div>
  );
}
