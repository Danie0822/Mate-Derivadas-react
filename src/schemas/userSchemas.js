import * as yup from 'yup';

// Schema para crear usuario
export const createUserSchema = yup.object().shape({
  full_name: yup
    .string()
    .required('El nombre completo es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(250, 'El nombre no debe exceder los 250 caracteres')
    .trim(),
  
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido')
    .max(250, 'El email no debe exceder los 250 caracteres')
    .trim(),
  
  rol: yup
    .string()
    .required('El rol es requerido')
    .oneOf(['admin', 'user'], 'El rol debe ser admin o user'),
  
  cellphone: yup
    .string()
    .required('El teléfono es requerido')
    .min(5, 'El teléfono debe tener al menos 5 caracteres')
    .max(20, 'El teléfono no debe exceder los 20 caracteres')
    .matches(/^[0-9+\-\s()]+$/, 'El teléfono solo puede contener números, +, -, espacios y paréntesis')
    .trim(),
  
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(250, 'La contraseña no debe exceder los 250 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'
    ),
});

// Schema para actualizar usuario (password opcional)
export const updateUserSchema = yup.object().shape({
  full_name: yup
    .string()
    .required('El nombre completo es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(250, 'El nombre no debe exceder los 250 caracteres')
    .trim(),
  
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido')
    .max(250, 'El email no debe exceder los 250 caracteres')
    .trim(),
  
  rol: yup
    .string()
    .required('El rol es requerido')
    .oneOf(['admin', 'user'], 'El rol debe ser admin o user'),
  
  cellphone: yup
    .string()
    .required('El teléfono es requerido')
    .min(5, 'El teléfono debe tener al menos 5 caracteres')
    .max(20, 'El teléfono no debe exceder los 20 caracteres')
    .matches(/^[0-9+\-\s()]+$/, 'El teléfono solo puede contener números, +, -, espacios y paréntesis')
    .trim(),
  
  password: yup
    .string()
    .optional()
    .nullable()
    .test('password-validation', 'La contraseña debe tener al menos 8 caracteres y contener: una minúscula, una mayúscula, un número y un carácter especial', function(value) {
      // Si el campo está vacío o es null, es válido para actualización
      if (!value || value.trim() === '') {
        return true;
      }
      
      // Si tiene contenido, debe cumplir las reglas
      if (value.length < 8 || value.length > 250) {
        return false;
      }
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      return passwordRegex.test(value);
    }),
});

// Schema para eliminar usuario
export const deleteUserSchema = yup.object().shape({
  id: yup
    .string()
    .required('El ID es requerido')
    .uuid('El ID debe ser un UUID válido'),
});

// Valores iniciales para formularios
export const initialUserValues = {
  full_name: '',
  email: '',
  rol: 'user',
  cellphone: '',
  password: '',
};

export const initialUpdateUserValues = {
  full_name: '',
  email: '',
  rol: 'user',
  cellphone: '',
  password: '',
};

// Opciones para select de roles
export const roleOptions = [
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Administrador' },
];

// Función para obtener el color del badge según el rol
export const getRoleBadgeColor = (rol) => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    user: 'bg-green-100 text-green-800',
  };
  return colors[rol] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el texto del rol en español
export const getRoleDisplayName = (rol) => {
  const names = {
    admin: 'Administrador',
    user: 'Usuario',
  };
  return names[rol] || rol;
};