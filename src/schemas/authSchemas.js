import * as yup from 'yup';

// Esquema de validación para el login
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Debe ser un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

// Esquema de validación para registro (para uso futuro)
export const registerSchema = yup.object({
  full_name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre completo es requerido'),
  email: yup
    .string()
    .email('Debe ser un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es requerido'),
  cellphone: yup
    .string()
    .required('El teléfono es requerido'),
});
