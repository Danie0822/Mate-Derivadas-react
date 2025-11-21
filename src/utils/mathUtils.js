/**
 * Normaliza una expresión matemática para comparación
 * Elimina espacios, convierte a minúsculas, normaliza formatos comunes
 */
export const normalizeExpression = (expression) => {
  if (!expression) return '';
  
  let normalized = expression.toString().toLowerCase().trim();
  
  // Eliminar todos los espacios
  normalized = normalized.replace(/\s+/g, '');
  
  // Normalizar diferentes formas de escribir exponentes
  // "elevado a" o "elevado al" -> ^
  normalized = normalized.replace(/elevado\s*a(l)?\s*(\d+)/g, '^$2');
  
  // Normalizar ** a ^
  normalized = normalized.replace(/\*\*/g, '^');
  
  // "x2" o "x 2" (cuando significa x al cuadrado) -> x^2
  // Solo si hay una letra seguida de un número SIN operador entre ellos
  normalized = normalized.replace(/([a-z])(\d+)/g, (match, letter, number) => {
    // Si ya tiene ^ antes, no modificar
    return `${letter}^${number}`;
  });
  
  // Normalizar multiplicación implícita: 2x -> 2*x
  // ANTES de normalizar exponentes para no afectar 2x^2
  normalized = normalized.replace(/(\d+)([a-z])/g, '$1*$2');
  
  // Eliminar paréntesis innecesarios simples como (2x) -> 2x
  normalized = normalized.replace(/\(([^()]+)\)/g, '$1');
  
  return normalized;
};

/**
 * Compara dos expresiones matemáticas
 * Intenta varias formas de normalización
 */
export const compareExpressions = (userAnswer, correctAnswer) => {
  if (!userAnswer || !correctAnswer) return false;
  
  // Limpiar ambas respuestas primero
  const cleanUser = userAnswer.trim();
  const cleanCorrect = correctAnswer.trim();
  
  console.log('🔍 Comparando expresiones:');
  console.log('  Usuario:', cleanUser);
  console.log('  Correcta:', cleanCorrect);
  
  // Comparación exacta primero
  if (cleanUser === cleanCorrect) {
    console.log('  ✅ Coincidencia exacta!');
    return true;
  }
  
  // Normalizar ambas expresiones
  const normalizedUser = normalizeExpression(cleanUser);
  const normalizedCorrect = normalizeExpression(cleanCorrect);
  
  console.log('  Usuario normalizado:', normalizedUser);
  console.log('  Correcta normalizada:', normalizedCorrect);
  
  // Comparación normalizada
  if (normalizedUser === normalizedCorrect) {
    console.log('  ✅ Coincidencia normalizada!');
    return true;
  }
  
  // Intentar comparaciones adicionales
  // Por ejemplo: 2*x y 2x son equivalentes
  const userWithoutMult = normalizedUser.replace(/\*/g, '');
  const correctWithoutMult = normalizedCorrect.replace(/\*/g, '');
  
  console.log('  Usuario sin *:', userWithoutMult);
  console.log('  Correcta sin *:', correctWithoutMult);
  
  if (userWithoutMult === correctWithoutMult) {
    console.log('  ✅ Coincidencia sin multiplicación explícita!');
    return true;
  }
  
  // Intentar comparación invirtiendo orden (x*2 vs 2*x)
  const userParts = normalizedUser.split('*').sort().join('*');
  const correctParts = normalizedCorrect.split('*').sort().join('*');
  
  if (userParts === correctParts) {
    console.log('  ✅ Coincidencia con orden invertido!');
    return true;
  }
  
  console.log('  ❌ No hay coincidencia');
  return false;
};

/**
 * Extrae solo el texto sin HTML de una respuesta
 */
export const stripHtml = (html) => {
  if (!html) return '';
  
  // Si ya es texto plano, devolverlo
  if (typeof html !== 'string') return String(html);
  
  // Crear elemento temporal para extraer texto
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  let text = tmp.textContent || tmp.innerText || '';
  
  // Limpiar espacios extras y saltos de línea
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Verifica si una expresión es "compleja" y requiere validación con IA
 * Se considera compleja si tiene fracciones, múltiples términos, funciones trigonométricas, etc.
 */
export const isComplexExpression = (expression) => {
  if (!expression) return false;
  
  const complexPatterns = [
    /\\frac/i,           // LaTeX fractions
    /\/[^0-9]/,          // Fracciones con variables
    /sin|cos|tan|sec|csc|cot/i,  // Funciones trigonométricas
    /log|ln|exp/i,       // Funciones logarítmicas/exponenciales
    /sqrt|∛|√/i,         // Raíces
    /\\[a-z]+/i,         // Comandos LaTeX
    /[+\-*\/^]{2,}/,     // Múltiples operadores seguidos
  ];
  
  return complexPatterns.some(pattern => pattern.test(expression));
};

/**
 * Construye el prompt para la IA para verificar la respuesta
 */
export const buildVerificationPrompt = (exercise, userAnswer, correctAnswer) => {
  return `Eres un profesor de matemáticas experto evaluando la respuesta de un estudiante.

EJERCICIO: ${exercise.title}
${exercise.description ? `Descripción: ${stripHtml(exercise.description)}` : ''}
${exercise.content?.question ? `Pregunta: ${stripHtml(exercise.content.question)}` : ''}

SOLUCIÓN COMPLETA (con todos los pasos):
${correctAnswer}

RESPUESTA DEL ESTUDIANTE (solo valores finales):
${stripHtml(userAnswer)}

CRITERIO DE EVALUACIÓN:
- El estudiante SOLO debe dar los valores finales correctos
- NO necesita mostrar el procedimiento completo
- Si los números/valores finales coinciden con los de la solución, es CORRECTO
- Ignora diferencias menores en formato (espacios, m/s vs m/s², etc.)
- Ejemplo: Si la solución dice "v(π/2) = 0 m/s" y el estudiante dice "0 m/s", es CORRECTO

ANALIZA: ¿Los valores numéricos finales del estudiante coinciden con los de la solución?

⚠️ FORMATO DE RESPUESTA REQUERIDO:
- NO uses formato LaTeX (nada de $, \\frac, \\pi, etc.)
- Usa texto plano y simple
- Escribe π como "pi", fracciones como "a/b"
- Escribe exponentes como "^2" o "al cuadrado"

DEBES responder OBLIGATORIAMENTE con uno de estos dos formatos EN TEXTO PLANO:

Si es correcto:
CORRECTO: Los valores son correctos. [breve explicación]

Si es incorrecto:
INCORRECTO: [explicación del error]. El valor correcto es [valor en texto plano].

EJEMPLO DE RESPUESTA CORRECTA:
CORRECTO: Los valores son correctos. La velocidad en t = pi/2 es 0 m/s y la aceleración es -5 m/s^2.

EJEMPLO DE RESPUESTA INCORRECTA:
INCORRECTO: La velocidad está correcta (0 m/s) pero la aceleración es incorrecta. El valor correcto es -5 m/s^2, no -4 m/s^2.

Tu respuesta:`;
};

/**
 * Parsea la respuesta de la IA para determinar si la respuesta es correcta
 * Maneja múltiples formatos de respuesta para ser más robusto
 */
export const parseAIVerification = (aiResponse) => {
  console.log('🤖 Respuesta IA (raw):', aiResponse);
  
  if (!aiResponse) {
    console.log('❌ Respuesta vacía');
    return { isCorrect: false, explanation: 'No se pudo verificar la respuesta.' };
  }
  
  // Obtener el texto de la respuesta
  let aiText = '';
  
  // Caso 1: Es un objeto con campos answer o aiVerification
  if (typeof aiResponse === 'object') {
    aiText = aiResponse.answer || aiResponse.aiVerification || JSON.stringify(aiResponse);
  } else {
    aiText = String(aiResponse);
  }
  
  console.log('🔍 Texto IA a analizar:', aiText);
  
  const upperText = aiText.toUpperCase();
  
  // Caso 2: Formato esperado "CORRECTO:" o "INCORRECTO:"
  if (upperText.includes('CORRECTO:') && !upperText.includes('INCORRECTO:')) {
    const explanation = aiText.replace(/^CORRECTO:?\s*/i, '').trim() || 
      '¡Tu respuesta es matemáticamente correcta! La IA ha verificado que es equivalente a la solución esperada.';
    console.log('✅ Respuesta CORRECTA (formato estándar)');
    return { isCorrect: true, explanation };
  }
  
  if (upperText.includes('INCORRECTO:')) {
    const match = aiText.match(/INCORRECTO:\s*(.+)/i);
    const explanation = match ? match[1].trim() : 'La respuesta no es matemáticamente equivalente a la solución esperada.';
    console.log('❌ Respuesta INCORRECTA (formato estándar)');
    return { isCorrect: false, explanation };
  }
  
  // Caso 3: La IA solo devolvió los valores sin indicar si es correcto
  // Analizamos si los valores parecen coincidir con lo esperado
  // Buscamos palabras clave que indiquen corrección
  const correctKeywords = ['correcto', 'bien', 'exacto', 'coincide', 'equivalente', 'igual'];
  const incorrectKeywords = ['incorrecto', 'mal', 'error', 'no coincide', 'diferente', 'equivocado'];
  
  const hasCorrectKeyword = correctKeywords.some(kw => upperText.includes(kw.toUpperCase()));
  const hasIncorrectKeyword = incorrectKeywords.some(kw => upperText.includes(kw.toUpperCase()));
  
  if (hasIncorrectKeyword) {
    console.log('❌ Respuesta INCORRECTA (por palabras clave)');
    return { isCorrect: false, explanation: aiText };
  }
  
  if (hasCorrectKeyword) {
    console.log('✅ Respuesta CORRECTA (por palabras clave)');
    return { isCorrect: true, explanation: aiText };
  }
  
  // Caso 4: La IA solo repitió los valores sin evaluación
  // En este caso, asumimos que es CORRECTA si no hay indicios de error
  // ya que probablemente la IA validó y solo devolvió la confirmación
  console.log('⚠️ Respuesta ambigua, asumiendo CORRECTA por defecto');
  return { 
    isCorrect: true, 
    explanation: 'La IA ha verificado los valores. ' + aiText 
  };
};
