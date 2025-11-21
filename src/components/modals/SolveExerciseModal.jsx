import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Button, Input, Card, CardContent, CardHeader } from '../ui';
import VerifyingAnswerModal from './VerifyingAnswerModal';
import { compareExpressions, isComplexExpression, stripHtml, buildVerificationPrompt, parseAIVerification } from '../../utils/mathUtils';
import { askAIQuestion } from '../../services/node/ai-questions.service';
import { createUserExercise } from '../../services/node/user-exercises.service';

// Polyfill para findDOMNode
if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = (node) => {
    return node?.nodeType === 1 ? node : null;
  };
}

// Componente para ReactQuill con manejo de errores mejorado
const ReactQuillWrapper = ({ value, onChange, modules, formats, placeholder, className, style }) => {
  const [ReactQuill, setReactQuill] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Cargar estilos CSS de Quill dinámicamente
    const loadQuillStyles = () => {
      const existingStyles = document.querySelector('link[href*="quill"]');
      if (!existingStyles) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        link.onload = () => setStylesLoaded(true);
        link.onerror = () => setStylesLoaded(true); // Continuar aunque falle
        document.head.appendChild(link);
      } else {
        setStylesLoaded(true);
      }
    };

    // Importar ReactQuill dinámicamente
    const loadReactQuill = async () => {
      try {
        loadQuillStyles();
        const { default: ReactQuillComponent } = await import('react-quill');
        setReactQuill(() => ReactQuillComponent);
      } catch (error) {
        console.warn('Error loading ReactQuill, using fallback textarea:', error);
        setHasError(true);
      }
    };

    loadReactQuill();
  }, []);

  // Si hay error, usar textarea alternativo mejorado
  if (hasError) {
    return (
      <div className="space-y-2">
        <textarea
          value={typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-vertical ${className}`}
          style={style}
        />
        <p className="text-xs text-gray-500">
          Editor de texto simple (el editor avanzado no está disponible)
        </p>
      </div>
    );
  }

  if (!ReactQuill && !hasError) {
    return (
      <div className="flex items-center justify-center p-8 border border-gray-300 rounded-lg bg-gray-50">
        <div className="text-gray-500">Cargando editor...</div>
      </div>
    );
  }

  if (!stylesLoaded) {
    return (
      <div className="flex items-center justify-center p-8 border border-gray-300 rounded-lg bg-gray-50">
        <div className="text-gray-500">Cargando estilos del editor...</div>
      </div>
    );
  }

  try {
    return (
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={className}
        style={style}
      />
    );
  } catch (error) {
    console.warn('Error rendering ReactQuill:', error);
    setHasError(true);
    return null;
  }
};

// Schema de validación para la respuesta
const solveExerciseSchema = yup.object().shape({
  userAnswer: yup
    .string()
    .required('La respuesta es requerida')
    .min(1, 'La respuesta no puede estar vacía')
    .trim()
});

const SolveExerciseModal = ({ 
  isOpen, 
  onClose, 
  exercise = null,
  onSubmitAnswer,
  userId = '550e8400-e29b-41d4-a716-446655440000' // ID por defecto, se puede pasar como prop
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control
  } = useForm({
    resolver: yupResolver(solveExerciseSchema),
    defaultValues: {
      userAnswer: ''
    },
    mode: 'onChange'
  });

  const watchedAnswer = watch('userAnswer');

  // Configuración de React Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'formula'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color', 'formula'
  ];

  // Reset form cuando se abre/cierra el modal o cambia el ejercicio
  useEffect(() => {
    if (isOpen) {
      reset();
      setUserAnswer('');
      setShowSolution(false);
      setHasSubmitted(false);
      setVerificationResult(null);
      setIsVerifying(false);
    }
  }, [isOpen, exercise, reset]);

  const handleFormSubmit = async (data) => {
    setHasSubmitted(true);
    setVerificationResult(null);
    
    const userAnswerText = stripHtml(data.userAnswer);
    
    // Obtener la solución correcta del ejercicio
    let correctSolution = '';
    if (exercise.solution) {
      if (typeof exercise.solution === 'object' && exercise.solution.answer) {
        correctSolution = exercise.solution.answer;
      } else if (typeof exercise.solution === 'string') {
        correctSolution = exercise.solution;
      }
    } else if (exercise.content?.solution) {
      correctSolution = exercise.content.solution;
    }
    
    const correctSolutionText = stripHtml(correctSolution);
    
    // Debug: mostrar en consola
    console.log('🔍 Verificación de respuesta:');
    console.log('Respuesta usuario (original):', data.userAnswer);
    console.log('Respuesta usuario (limpia):', userAnswerText);
    console.log('Solución correcta (original):', correctSolution);
    console.log('Solución correcta (limpia):', correctSolutionText);
    
    // Paso 1: Comparación directa
    if (compareExpressions(userAnswerText, correctSolutionText)) {
      // Respuesta correcta!
      setVerificationResult({ 
        isCorrect: true, 
        message: '¡Correcto! Tu respuesta es matemáticamente equivalente a la solución esperada.' 
      });
      toast.success('¡Excelente! Tu respuesta es correcta.');
      
      // Guardar el registro del ejercicio resuelto
      try {
        await createUserExercise({
          user_id: userId,
          exercise_id: exercise.id,
          answer: { answer: userAnswerText },
          is_correct: true,
          answered_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error al guardar el ejercicio resuelto:', error);
      }
      
      if (onSubmitAnswer) {
        onSubmitAnswer({
          exerciseId: exercise.id,
          userAnswer: data.userAnswer,
          correctSolution: correctSolution,
          isCorrect: true
        });
      }
      
      return;
    }
    
    // Paso 2: Verificar si la expresión es compleja
    const isComplex = isComplexExpression(correctSolutionText) || isComplexExpression(userAnswerText);
    
    if (!isComplex) {
      // No es compleja y no coincidió, entonces es incorrecta
      setVerificationResult({ isCorrect: false, message: 'La respuesta no coincide con la solución esperada.' });
      toast.error('Respuesta incorrecta. Revisa tu solución.');
      
      // Guardar como incorrecta
      try {
        await createUserExercise({
          user_id: userId,
          exercise_id: exercise.id,
          answer: { answer: userAnswerText },
          is_correct: false,
          answered_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error al guardar el ejercicio resuelto:', error);
      }
      
      if (onSubmitAnswer) {
        onSubmitAnswer({
          exerciseId: exercise.id,
          userAnswer: data.userAnswer,
          correctSolution: correctSolution,
          isCorrect: false
        });
      }
      
      return;
    }
    
    // Paso 3: Es compleja, usar IA para verificar
    setIsVerifying(true);
    
    try {
      const prompt = buildVerificationPrompt(exercise, userAnswerText, correctSolutionText);
      
      const response = await askAIQuestion({
        user_id: userId,
        question: prompt,
        disable_latex: true  // Importante: desactiva el formateo LaTeX para verificaciones
      });
      
      console.log('📡 Respuesta completa de la API:', response);
      
      // Extraer la respuesta de la IA del formato de respuesta
      const aiAnswer = response.data?.answer || response.answer || response.data || response;
      
      console.log('🤖 Respuesta IA extraída:', aiAnswer);
      
      // Parsear la respuesta de la IA usando la función mejorada
      const { isCorrect, explanation } = parseAIVerification(aiAnswer);
      
      setVerificationResult({ 
        isCorrect, 
        message: explanation 
      });
      
      if (isCorrect) {
        toast.success('¡Excelente! Tu respuesta es correcta.');
      } else {
        toast.error(`Respuesta incorrecta: ${explanation}`, { duration: 6000 });
      }
      
      // Guardar el resultado
      try {
        await createUserExercise({
          user_id: userId,
          exercise_id: exercise.id,
          answer: { 
            answer: userAnswerText,
            aiVerification: aiAnswer
          },
          is_correct: isCorrect,
          answered_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error al guardar el ejercicio resuelto:', error);
      }
      
      if (onSubmitAnswer) {
        onSubmitAnswer({
          exerciseId: exercise.id,
          userAnswer: data.userAnswer,
          correctSolution: correctSolution,
          isCorrect,
          aiVerification: aiAnswer
        });
      }
      
    } catch (error) {
      console.error('Error al verificar con IA:', error);
      toast.error('Error al verificar la respuesta con la IA. Por favor, intenta de nuevo.');
      setVerificationResult({ 
        isCorrect: false, 
        message: 'No se pudo verificar la respuesta. Por favor, intenta de nuevo.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Intermedio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  if (!isOpen || !exercise) return null;

  return (
    <>
      {/* Modal de verificación */}
      <VerifyingAnswerModal isOpen={isVerifying} />
      
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              Resolver Ejercicio
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {exercise.title}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
              {getDifficultyText(exercise.difficulty)}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-200px)]">
          {/* Descripción del ejercicio */}
          {exercise.description && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Descripción</h3>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: exercise.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Contenido/Pregunta del ejercicio */}
          {exercise.content && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Pregunta</h3>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: exercise.content.question || JSON.stringify(exercise.content) }}
                />
              </CardContent>
            </Card>
          )}

          {/* Formulario de respuesta */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Tu Respuesta</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escribe tu solución:
                  </label>
                  <Controller
                    name="userAnswer"
                    control={control}
                    render={({ field }) => (
                      <ReactQuillWrapper
                        value={userAnswer}
                        onChange={(value) => {
                          setUserAnswer(value);
                          setValue('userAnswer', value);
                          field.onChange(value);
                        }}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Escribe tu respuesta aquí..."
                        className="bg-white"
                        style={{ minHeight: '150px' }}
                      />
                    )}
                  />
                  {errors.userAnswer && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.userAnswer.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isVerifying || (hasSubmitted && verificationResult) || !userAnswer?.trim()}
                    className="flex-1"
                  >
                    {isVerifying ? 'Verificando...' : hasSubmitted ? 'Respuesta Enviada' : 'Enviar Respuesta'}
                  </Button>
                  
                  {hasSubmitted && verificationResult && !showSolution && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleShowSolution}
                      className="flex-1"
                    >
                      Ver Solución
                    </Button>
                  )}
                </div>

                {/* Resultado de la verificación */}
                {verificationResult && (
                  <div className={`mt-4 p-5 rounded-lg border-2 ${
                    verificationResult.isCorrect 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      {verificationResult.isCorrect ? (
                        <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg mb-2 ${
                          verificationResult.isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {verificationResult.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                        </h4>
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          verificationResult.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {verificationResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Mostrar solución después de enviar respuesta */}
          {showSolution && hasSubmitted && exercise.solution && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <h3 className="text-lg font-semibold text-green-800">Solución</h3>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-green-900"
                  dangerouslySetInnerHTML={{ 
                    __html: exercise.solution.answer || JSON.stringify(exercise.solution) 
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tags del ejercicio */}
          {exercise.tags && exercise.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Etiquetas:</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
      </div>
    </>
  );
};

export default SolveExerciseModal;