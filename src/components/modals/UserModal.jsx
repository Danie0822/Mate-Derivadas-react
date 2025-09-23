import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../ui';
import { UserFormSkeleton } from '../ui/Skeleton';
import { createUserSchema, updateUserSchema, initialUserValues, roleOptions } from '../../schemas/userSchemas';

const UserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user = null, 
  isLoading = false,
  isSubmitting = false 
}) => {
  const isEditing = Boolean(user);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: initialUserValues,
    mode: 'onChange'
  });

  // Efecto para cargar los datos del usuario cuando se abre el modal de edición
  useEffect(() => {
    if (isOpen && isEditing && user) {
      // Cargar datos del usuario para editar
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
        rol: user.rol || 'user',
        cellphone: user.cellphone || '',
        password: '' // Siempre vacío en edición
      });
    } else if (isOpen && !isEditing) {
      // Limpiar formulario para crear nuevo usuario
      reset(initialUserValues);
    }
  }, [isOpen, isEditing, user, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    // Si estamos editando y la contraseña está vacía, la eliminamos del payload
    if (isEditing && (!data.password || data.password.trim() === '')) {
      delete data.password;
    }
    
    await onSubmit(data);
    if (!isSubmitting) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
                
                {isLoading ? (
                  <UserFormSkeleton />
                ) : (
                  <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Nombre completo */}
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Ingrese el nombre completo"
                        {...register('full_name')}
                        error={errors.full_name?.message}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        {...register('email')}
                        error={errors.email?.message}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Rol */}
                    <div>
                      <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
                        Rol *
                      </label>
                      <select
                        id="rol"
                        {...register('rol')}
                        disabled={isSubmitting}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {roleOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.rol && (
                        <p className="mt-1 text-sm text-red-600">{errors.rol.message}</p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label htmlFor="cellphone" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <Input
                        id="cellphone"
                        type="tel"
                        placeholder="+1234567890"
                        {...register('cellphone')}
                        error={errors.cellphone?.message}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña {isEditing ? '(opcional)' : '*'}
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={isEditing ? "Dejar vacío para mantener actual" : "Mínimo 8 caracteres"}
                          {...register('password')}
                          error={errors.password?.message}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[100px]"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                            </svg>
                            {isEditing ? 'Actualizando...' : 'Creando...'}
                          </>
                        ) : (
                          isEditing ? 'Actualizar Usuario' : 'Crear Usuario'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;