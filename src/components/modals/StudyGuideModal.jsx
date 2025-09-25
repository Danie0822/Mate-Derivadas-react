import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { 
  initialStudyGuideValues, 
  createStudyGuideSchema, 
  updateStudyGuideSchema,
  getLevelText 
} from '../../schemas/studyGuideSchemas';
import { getExercisesForSelect } from '../../services/node/exercises.service';
import { Select } from '../ui';

// Polyfill para findDOMNode
if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = (node) => {
    if (node instanceof Element) {
      return node;
    }
    return null;
  };
}

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
      <div className="flex items-center justify-center h-[150px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (!stylesLoaded) {
    return (
      <div className="flex items-center justify-center h-[150px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando estilos...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="quill-wrapper">
        <ReactQuill
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className={className}
          style={style}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering ReactQuill:', error);
    setHasError(true);
    return null;
  }
};

const StudyGuideModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  studyGuide = null, 
  isLoading = false,
  isSubmitting = false 
}) => {
  const isEditing = Boolean(studyGuide);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState([]);
  const [resourceInput, setResourceInput] = useState({ type: 'video', url: '', title: '' });
  const [exercises, setExercises] = useState([]);
  const [exerciseInput, setExerciseInput] = useState({ exercise_id: '', title: '', order: 1, required: false });

  // Query para obtener ejercicios para el select
  const { 
    data: exercisesResponse, 
    isLoading: isLoadingExercises 
  } = useQuery({
    queryKey: ['exercisesForSelect'],
    queryFn: getExercisesForSelect,
    enabled: isOpen
  });

  // Extraer los datos de la respuesta con mejor manejo
  const exercisesForSelect = useMemo(() => {
    if (!exercisesResponse) return [];
    // Si exercisesResponse es un array, úsalo directamente
    if (Array.isArray(exercisesResponse)) return exercisesResponse;
    // Si tiene una propiedad data, úsala
    if (exercisesResponse.data && Array.isArray(exercisesResponse.data)) return exercisesResponse.data;
    return [];
  }, [exercisesResponse]);

  // Preparar opciones para el select
  const exerciseOptions = useMemo(() => {
    if (!exercisesForSelect || exercisesForSelect.length === 0) return [];
    return exercisesForSelect.map(exercise => ({
      value: exercise.id,
      label: exercise.title,
      sublabel: exercise.topic || 'Sin tema'
    }));
  }, [exercisesForSelect]);

  // Debug: log para verificar los datos (remover cuando no sea necesario)
  // console.log('exercisesResponse:', exercisesResponse);
  // console.log('Array.isArray(exercisesResponse):', Array.isArray(exercisesResponse));
  // console.log('exercisesForSelect:', exercisesForSelect);
  // console.log('exerciseOptions:', exerciseOptions);
  // console.log('isLoadingExercises:', isLoadingExercises);

  // Estilos CSS básicos como fallback
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.textContent = `
        .ql-editor {
          min-height: 150px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
        }
        .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
        }
        .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
        }
        .ql-editor.ql-blank::before {
          font-style: italic;
          color: #999;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
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
    resolver: yupResolver(isEditing ? updateStudyGuideSchema : createStudyGuideSchema),
    defaultValues: initialStudyGuideValues,
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

  // Efecto para cargar los datos de la guía cuando se abre el modal de edición
  useEffect(() => {
    if (isOpen && isEditing && studyGuide) {
      reset({
        title: studyGuide.title || '',
        description: studyGuide.description || '',
        week: studyGuide.week || 1,
        day: studyGuide.day || 1,
        topic: studyGuide.topic || '',
        level: studyGuide.level || 'beginner',
        content: studyGuide.content || { introduction: '', theory: '', examples: '', notes: '' }
      });
      setTags(studyGuide.tags || []);
      setResources(studyGuide.resources || []);
      setExercises(studyGuide.exercises || []);
    } else if (isOpen && !isEditing) {
      reset(initialStudyGuideValues);
      setTags([]);
      setResources([]);
      setExercises([]);
    }
  }, [isOpen, isEditing, studyGuide, reset]);

  const handleClose = () => {
    reset();
    setTags([]);
    setResources([]);
    setExercises([]);
    onClose();
  };

  const handleFormSubmit = async (data) => {
    const finalData = {
      ...data,
      tags,
      resources,
      exercises
    };
    
    if (isEditing) {
      finalData.id = studyGuide.id;
    }

    await onSubmit(finalData);
  };

  // Manejo de tags
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Manejo de recursos
  const addResource = () => {
    if (resourceInput.url.trim() && resourceInput.title.trim()) {
      setResources([...resources, { ...resourceInput }]);
      setResourceInput({ type: 'video', url: '', title: '' });
    }
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  // Manejo de ejercicios
  const addExercise = () => {
    if (exerciseInput.exercise_id.trim() && exerciseInput.title.trim()) {
      setExercises([...exercises, { ...exerciseInput }]);
      setExerciseInput({ exercise_id: '', title: '', order: exercises.length + 2, required: false });
    }
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {isEditing ? 'Editar Guía de Estudio' : 'Nueva Guía de Estudio'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                {...register('title')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ingresa el título de la guía de estudio"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semana *
              </label>
              <input
                {...register('week', { valueAsNumber: true })}
                type="number"
                min="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.week ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.week && (
                <p className="mt-1 text-sm text-red-600">{errors.week.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Día *
              </label>
              <input
                {...register('day', { valueAsNumber: true })}
                type="number"
                min="1"
                max="7"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.day ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.day && (
                <p className="mt-1 text-sm text-red-600">{errors.day.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <input
                {...register('topic')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.topic ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ej: Derivadas, Integrales, etc."
              />
              {errors.topic && (
                <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel
              </label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.level ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>  
                    <option value="advanced">Avanzado</option>
                  </select>
                )}
              />
              {errors.level && (
                <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe brevemente el contenido de la guía"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Agregar etiqueta"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Contenido Educativo */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Contenido Educativo
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Introducción
                </label>
                <Controller
                  name="content.introduction"
                  control={control}
                  render={({ field }) => (
                    <ReactQuillWrapper
                      value={field.value || ''}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Introducción al tema..."
                      className="bg-white"
                      style={{ minHeight: '150px' }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Teoría
                </label>
                <Controller
                  name="content.theory"
                  control={control}
                  render={({ field }) => (
                    <ReactQuillWrapper
                      value={field.value || ''}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Contenido teórico..."
                      className="bg-white"
                      style={{ minHeight: '150px' }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Ejemplos
                </label>
                <Controller
                  name="content.examples"
                  control={control}
                  render={({ field }) => (
                    <ReactQuillWrapper
                      value={field.value || ''}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Ejemplos prácticos..."
                      className="bg-white"
                      style={{ minHeight: '150px' }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Notas
                </label>
                <Controller
                  name="content.notes"
                  control={control}
                  render={({ field }) => (
                    <ReactQuillWrapper
                      value={field.value || ''}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Notas adicionales..."
                      className="bg-white"
                      style={{ minHeight: '150px' }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recursos Externos
            </label>
            
            {resources.length > 0 && (
              <div className="space-y-2 mb-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {resource.type}
                    </span>
                    <span className="flex-1 text-sm">{resource.title}</span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver
                    </a>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select
                value={resourceInput.type}
                onChange={(e) => setResourceInput({ ...resourceInput, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="link">Link</option>
                <option value="article">Artículo</option>
              </select>
              <input
                type="text"
                value={resourceInput.title}
                onChange={(e) => setResourceInput({ ...resourceInput, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título del recurso"
              />
              <input
                type="url"
                value={resourceInput.url}
                onChange={(e) => setResourceInput({ ...resourceInput, url: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="URL del recurso"
              />
              <button
                type="button"
                onClick={addResource}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Ejercicios Relacionados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ejercicios Relacionados
            </label>
            
            {exercises.length > 0 && (
              <div className="space-y-2 mb-4">
                {exercises.map((exercise, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      #{exercise.order}
                    </span>
                    <span className="flex-1 text-sm">{exercise.title}</span>
                    {exercise.required && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                        Requerido
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="md:col-span-2">
                <Select
                  options={exerciseOptions}
                  value={exerciseInput.exercise_id}
                  onChange={(e) => {
                    const selectedExercise = exercisesForSelect.find(ex => ex.id === e.target.value);
                    setExerciseInput({ 
                      ...exerciseInput, 
                      exercise_id: e.target.value,
                      title: selectedExercise?.title || ''
                    });
                  }}
                  placeholder="Seleccionar ejercicio..."
                  searchable={true}
                  isLoading={isLoadingExercises}
                  valueKey="value"
                  labelKey="label"
                  sublabelKey="sublabel"
                />
              </div>
              <input
                type="number"
                value={exerciseInput.order}
                onChange={(e) => setExerciseInput({ ...exerciseInput, order: parseInt(e.target.value) || 1 })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Orden"
                min="1"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg flex-1">
                  <input
                    type="checkbox"
                    checked={exerciseInput.required}
                    onChange={(e) => setExerciseInput({ ...exerciseInput, required: e.target.checked })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Requerido</span>
                </label>
                <button
                  type="button"
                  onClick={addExercise}
                  disabled={!exerciseInput.exercise_id || !exerciseInput.title}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end -mx-6 -mb-6 rounded-b-xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Actualizar' : 'Crear'} Guía</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyGuideModal;