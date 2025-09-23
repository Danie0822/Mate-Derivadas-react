import { useEffect } from 'react';
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
      toast.success('¡Bienvenido! Sesión iniciada correctamente', {
        duration: 3000,
      });
      navigate({ to: '/dashboard', replace: true });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al iniciar sesión', {
        duration: 5000,
      });
      console.error('Error en login:', error);
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/Derivium-Logo.avif"
              alt="Derivium"
              className="h-20 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Ingresa a tu cuenta de Derivium
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-t-lg">
            <h3 className="text-lg font-medium text-center">
              Bienvenido de vuelta
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  isLoading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg"
                >
                  {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
