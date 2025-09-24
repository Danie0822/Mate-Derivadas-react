import * as yup from 'yup';

// Valores iniciales para formularios de ejercicios
export const initialExerciseValues = {
  title: '',
  description: '',  
  difficulty: 'easy',
  content: { question: '' },
  solution: { answer: '' },
  topic: '',
  tags: []
};

// Schema para crear ejercicio
export const createExerciseSchema = yup.object().shape({
  title: yup
    .string()
    .required('El título es requerido')
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(255, 'El título no debe exceder los 255 caracteres')
    .trim(),
  
  description: yup
    .string()
    .max(10000, 'La descripción no debe exceder los 10000 caracteres')
    .nullable(),
  
  difficulty: yup
    .string()
    .required('La dificultad es requerida')
    .oneOf(['easy', 'medium', 'hard'], 'La dificultad debe ser easy, medium o hard'),
  
  content: yup
    .object()
    .required('El contenido es requerido')
    .test('content-not-empty', 'El contenido no puede estar vacío', (value) => {
      if (!value) return false;
      // Si es un objeto con question, verificar que question no esté vacío
      if (value.question !== undefined) {
        return value.question && value.question.trim().length > 0;
      }
      // Si es un objeto genérico, verificar que tenga al menos una propiedad con valor
      return Object.keys(value).length > 0 && Object.values(value).some(v => v && String(v).trim().length > 0);
    }),
  
  solution: yup
    .object()
    .nullable(),
  
  topic: yup
    .string()
    .max(255, 'El tema no debe exceder los 255 caracteres')
    .nullable()
    .trim(),
  
  tags: yup
    .array()
    .of(yup.string().trim())
    .nullable()
    .default([])
});

// Schema para actualizar ejercicio  
export const updateExerciseSchema = yup.object().shape({
  title: yup
    .string()
    .required('El título es requerido')
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(255, 'El título no debe exceder los 255 caracteres')
    .trim(),
  
  description: yup
    .string()
    .max(10000, 'La descripción no debe exceder los 10000 caracteres')
    .nullable(),
  
  difficulty: yup
    .string()
    .required('La dificultad es requerida')
    .oneOf(['easy', 'medium', 'hard'], 'La dificultad debe ser easy, medium o hard'),
  
  content: yup
    .object()
    .required('El contenido es requerido')
    .test('content-not-empty', 'El contenido no puede estar vacío', (value) => {
      if (!value) return false;
      // Si es un objeto con question, verificar que question no esté vacío
      if (value.question !== undefined) {
        return value.question && value.question.trim().length > 0;
      }
      // Si es un objeto genérico, verificar que tenga al menos una propiedad con valor
      return Object.keys(value).length > 0 && Object.values(value).some(v => v && String(v).trim().length > 0);
    }),
  
  solution: yup
    .object()
    .nullable(),
  
  topic: yup
    .string()
    .max(255, 'El tema no debe exceder los 255 caracteres')
    .nullable()
    .trim(),
  
  tags: yup
    .array()
    .of(yup.string().trim())
    .nullable()
    .default([])
});

// Función helper para validar datos de ejercicio
export const validateExerciseData = (data, isEditing = false) => {
  const schema = isEditing ? updateExerciseSchema : createExerciseSchema;
  
  try {
    return {
      isValid: true,
      data: schema.validateSync(data, { stripUnknown: true }),
      errors: {}
    };
  } catch (error) {
    return {
      isValid: false,
      data: null,
      errors: error.errors || [error.message]
    };
  }
};