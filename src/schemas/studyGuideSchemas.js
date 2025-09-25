import * as yup from 'yup';

// Valores iniciales para formularios de guías de estudio
export const initialStudyGuideValues = {
  title: '',
  description: '',
  week: 1,
  day: 1,
  resources: [],
  topic: '',
  level: 'beginner',
  tags: [],
  content: { introduction: '', theory: '', examples: '', notes: '' },
  exercises: []
};

// Schema para crear guía de estudio
export const createStudyGuideSchema = yup.object().shape({
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
  
  week: yup
    .number()
    .required('La semana es requerida')
    .integer('La semana debe ser un número entero')
    .min(1, 'La semana debe ser mayor a 0'),
  
  day: yup
    .number()
    .required('El día es requerido')
    .integer('El día debe ser un número entero')
    .min(1, 'El día debe ser mayor a 0')
    .max(7, 'El día no puede ser mayor a 7'),
  
  resources: yup
    .array()
    .of(
      yup.object().shape({
        type: yup.string().required('El tipo de recurso es requerido'),
        url: yup.string().url('Debe ser una URL válida').required('La URL es requerida'),
        title: yup.string().required('El título del recurso es requerido')
      })
    )
    .nullable()
    .default([]),
  
  topic: yup
    .string()
    .max(255, 'El tema no debe exceder los 255 caracteres')
    .nullable()
    .trim(),
  
  level: yup
    .string()
    .oneOf(['beginner', 'intermediate', 'advanced'], 'El nivel debe ser beginner, intermediate o advanced')
    .nullable()
    .default('beginner'),
  
  tags: yup
    .array()
    .of(yup.string().trim())
    .nullable()
    .default([]),
  
  content: yup
    .object()
    .test('content-not-empty', 'El contenido no puede estar completamente vacío', (value) => {
      if (!value) return true; // Permitir null/undefined
      
      // Si es un objeto, verificar que al menos un campo tenga contenido
      const hasContent = Object.values(value).some(field => 
        typeof field === 'string' && field.trim().length > 0
      );
      
      return hasContent || Object.keys(value).length === 0;
    })
    .nullable(),
  
  exercises: yup
    .array()
    .of(
      yup.object().shape({
        exercise_id: yup.string().uuid('Debe ser un UUID válido').required('El ID del ejercicio es requerido'),
        title: yup.string().required('El título del ejercicio es requerido'),
        order: yup.number().integer('El orden debe ser un número entero').min(1, 'El orden debe ser mayor a 0'),
        required: yup.boolean().default(false)
      })
    )
    .nullable()
    .default([])
});

// Schema para actualizar guía de estudio  
export const updateStudyGuideSchema = yup.object().shape({
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
  
  week: yup
    .number()
    .required('La semana es requerida')
    .integer('La semana debe ser un número entero')
    .min(1, 'La semana debe ser mayor a 0'),
  
  day: yup
    .number()
    .required('El día es requerido')
    .integer('El día debe ser un número entero')
    .min(1, 'El día debe ser mayor a 0')
    .max(7, 'El día no puede ser mayor a 7'),
  
  resources: yup
    .array()
    .of(
      yup.object().shape({
        type: yup.string().required('El tipo de recurso es requerido'),
        url: yup.string().url('Debe ser una URL válida').required('La URL es requerida'),
        title: yup.string().required('El título del recurso es requerido')
      })
    )
    .nullable()
    .default([]),
  
  topic: yup
    .string()
    .max(255, 'El tema no debe exceder los 255 caracteres')
    .nullable()
    .trim(),
  
  level: yup
    .string()
    .oneOf(['beginner', 'intermediate', 'advanced'], 'El nivel debe ser beginner, intermediate o advanced')
    .nullable()
    .default('beginner'),
  
  tags: yup
    .array()
    .of(yup.string().trim())
    .nullable()
    .default([]),
  
  content: yup
    .object()
    .test('content-not-empty', 'El contenido no puede estar completamente vacío', (value) => {
      if (!value) return true;
      
      const hasContent = Object.values(value).some(field => 
        typeof field === 'string' && field.trim().length > 0
      );
      
      return hasContent || Object.keys(value).length === 0;
    })
    .nullable(),
  
  exercises: yup
    .array()
    .of(
      yup.object().shape({
        exercise_id: yup.string().uuid('Debe ser un UUID válido').required('El ID del ejercicio es requerido'),
        title: yup.string().required('El título del ejercicio es requerido'),
        order: yup.number().integer('El orden debe ser un número entero').min(1, 'El orden debe ser mayor a 0'),
        required: yup.boolean().default(false)
      })
    )
    .nullable()
    .default([])
});

// Función helper para validar datos de guía de estudio
export const validateStudyGuideData = (data, isEditing = false) => {
  try {
    const schema = isEditing ? updateStudyGuideSchema : createStudyGuideSchema;
    schema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (validationError) {
    const errors = {};
    validationError.inner.forEach(error => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};

// Función helper para obtener texto del nivel
export const getLevelText = (level) => {
  const levels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio', 
    advanced: 'Avanzado'
  };
  return levels[level] || level;
};

// Función helper para obtener color del nivel
export const getLevelColor = (level) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};