import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ReactDOM from 'react-dom';

// Polyfill para findDOMNode
if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = (node) => {
    if (node == null) return null;
    if (node.nodeType === 1) return node;
    return node;
  };
}
import { 
  createExerciseSchema, 
  updateExerciseSchema, 
  initialExerciseValues 
} from '../../schemas/exerciseSchemas';
import { Button, Input, Card, CardContent, CardHeader } from '../ui';

// Componente para ReactQuill con manejo de errores mejorado
const ReactQuillWrapper = ({ value, onChange, modules, formats, placeholder, className, style }) => {
  const [ReactQuill, setReactQuill] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Función para cargar estilos CSS manualmente
    const loadQuillStyles = () => {
      // Verificar si ya se cargaron los estilos
      if (document.querySelector('#quill-styles')) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.id = 'quill-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        // Usar el archivo copiado en public
        link.href = '/quill.snow.css';
        
        link.onload = () => {
          console.log('Estilos de Quill cargados correctamente');
          resolve();
        };
        
        link.onerror = () => {
          console.warn('No se pudieron cargar los estilos de Quill desde node_modules');
          resolve(); // Continuar sin estilos
        };
        
        document.head.appendChild(link);
      });
    };

    // Importación dinámica de ReactQuill con carga de estilos
    const loadQuill = async () => {
      try {
        // Cargar estilos primero
        await loadQuillStyles();
        
        // Luego cargar el componente
        const module = await import('react-quill');
        setReactQuill(() => module.default);
        setStylesLoaded(true);
        setHasError(false);
      } catch (error) {
        console.warn('ReactQuill no disponible, usando editor alternativo:', error);
        setHasError(true);
        setStylesLoaded(true);
      }
    };

    loadQuill();
  }, []);

  // Si hay error, usar textarea alternativo mejorado
  if (hasError) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Editor básico activo - Funcionalidad completa disponible
        </div>
        <div className="relative">
          <textarea
            value={value?.replace(/<[^>]*>/g, '') || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
            rows={6}
            style={{ minHeight: style?.height || '150px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
            {(value?.replace(/<[^>]*>/g, '') || '').length} caracteres
          </div>
        </div>
      </div>
    );
  }

  if (!ReactQuill && !hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-r from-blue-50 to-white border border-gray-300 rounded-lg`} style={style}>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Cargando editor enriquecido...
        </div>
      </div>
    );
  }

  try {
    return (
      <div style={{ ...style }}>
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className={className}
          style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering ReactQuill:', error);
    setHasError(true);
    return null;
  }
};

const ExerciseModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  exercise = null, 
  isLoading = false,
  isSubmitting = false 
}) => {
  const isEditing = Boolean(exercise);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Estilos CSS básicos como fallback
  useEffect(() => {
    if (isOpen && !document.querySelector('#quill-fallback-styles')) {
      const style = document.createElement('style');
      style.id = 'quill-fallback-styles';
      style.textContent = `
        .ql-toolbar {
          border: 1px solid #ccc;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f8f9fa;
        }
        .ql-container {
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 8px 8px;
          background: white;
        }
        .ql-editor {
          min-height: 120px;
          font-size: 14px;
          line-height: 1.5;
          padding: 12px;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
      `;
      document.head.appendChild(style);
    }
  }, [isOpen]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(isEditing ? updateExerciseSchema : createExerciseSchema),
    defaultValues: initialExerciseValues,
    mode: 'onChange'
  });

  // Configuración de React Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'formula'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'formula'
  ];

  // Efecto para cargar los datos del ejercicio cuando se abre el modal de edición
  useEffect(() => {
    if (isOpen) {
      if (isEditing && exercise) {
        reset({
          title: exercise.title || '',
          description: exercise.description || '',
          difficulty: exercise.difficulty || 'easy',
          content: exercise.content || { question: '' },
          solution: exercise.solution || { answer: '' },
          topic: exercise.topic || '',
          tags: exercise.tags || []
        });
        setTags(exercise.tags || []);
      } else {
        reset(initialExerciseValues);
        setTags([]);
      }
      setTagInput('');
    }
  }, [isOpen, isEditing, exercise, reset]);

  const handleClose = () => {
    reset(initialExerciseValues);
    setTags([]);
    setTagInput('');
    onClose();
  };

  const handleFormSubmit = async (data) => {
    const exerciseData = {
      ...data,
      tags: tags,
      content: data.content || { question: '' },
      solution: data.solution || { answer: '' }
    };
    
    console.log('Enviando datos del ejercicio:', exerciseData);
    
    try {
      await onSubmit(exerciseData);
      handleClose();
    } catch (error) {
      console.error('Error al enviar ejercicio:', error);
    }
  };

  // Manejo de tags
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800',
      medium: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800',
      hard: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={handleClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <img
                      src="/Derivium-Logo.avif"
                      alt="Derivium"
                      className="h-5 w-auto"
                    />
                    <span className="text-sm text-white/90">
                      {isEditing ? 'Modifica los datos del ejercicio' : 'Completa la información del ejercicio'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 bg-gradient-to-br from-white to-blue-50/30">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Título */}
                <Input
                  label="Título del Ejercicio"
                  placeholder="Ej: Derivada de funciones polinómicas"
                  error={errors.title?.message}
                  {...register('title')}
                />

                {/* Topic y Difficulty en la misma fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tema"
                    placeholder="Ej: Derivadas básicas"
                    error={errors.topic?.message}
                    {...register('topic')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dificultad
                    </label>
                    <select
                      {...register('difficulty')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Medio</option>
                      <option value="hard">Difícil</option>
                    </select>
                    {errors.difficulty && (
                      <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                    )}
                  </div>
                </div>

                {/* Descripción con React Quill */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <ReactQuillWrapper
                        value={field.value || ''}
                        onChange={field.onChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Describe el ejercicio, incluye el problema a resolver..."
                        className="bg-white rounded-lg"
                        style={{ height: '150px', marginBottom: '50px' }}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Contenido del ejercicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido del Ejercicio
                  </label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <ReactQuillWrapper
                        value={typeof field.value === 'string' ? field.value : field.value?.question || ''}
                        onChange={(value) => field.onChange({ question: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Escribe el enunciado completo del ejercicio, la pregunta que debe resolver el estudiante..."
                        className="bg-white rounded-lg"
                        style={{ height: '150px', marginBottom: '50px' }}
                      />
                    )}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>

                {/* Solución con React Quill */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solución
                    <span className="text-sm text-gray-500 ml-1">(Opcional)</span>
                  </label>
                  <Controller
                    name="solution"
                    control={control}
                    render={({ field }) => (
                      <ReactQuillWrapper
                        value={typeof field.value === 'string' ? field.value : field.value?.answer || ''}
                        onChange={(value) => field.onChange({ answer: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Proporciona la solución detallada del ejercicio..."
                        className="bg-white rounded-lg"
                        style={{ height: '120px', marginBottom: '50px' }}
                      />
                    )}
                  />
                  {errors.solution && (
                    <p className="mt-1 text-sm text-red-600">{errors.solution.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-100 to-green-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Agregar etiqueta"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="outline"
                      className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100"
                    >
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Vista previa de dificultad */}
                {watch('difficulty') && (
                  <div className="p-3 rounded-lg bg-gray-50 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vista previa:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(watch('difficulty'))}`}>
                        {watch('difficulty') === 'easy' ? 'Fácil' : 
                         watch('difficulty') === 'medium' ? 'Medio' : 'Difícil'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg"
                  >
                    {isSubmitting 
                      ? (isEditing ? 'Actualizando...' : 'Creando...') 
                      : (isEditing ? 'Actualizar Ejercicio' : 'Crear Ejercicio')
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;