import React, { useState, useEffect } from 'react';

const mathematicianQuotes = [
  { quote: "Las matemáticas son el alfabeto con el cual Dios ha escrito el universo.", author: "Galileo Galilei" },
  { quote: "En matemáticas no se comprenden las cosas, uno simplemente se acostumbra a ellas.", author: "John von Neumann" },
  { quote: "La matemática es la reina de las ciencias y la aritmética es la reina de las matemáticas.", author: "Carl Friedrich Gauss" },
  { quote: "Lo que hemos de aprender lo aprendemos haciendo.", author: "Aristóteles" },
  { quote: "Las matemáticas no mienten, lo que hay son muchos matemáticos mentirosos.", author: "Henry David Thoreau" },
  { quote: "La matemática es el arte de dar el mismo nombre a cosas diferentes.", author: "Henri Poincaré" },
  { quote: "En las matemáticas la belleza puede ser más importante que la utilidad.", author: "Bertrand Russell" },
  { quote: "Las matemáticas son una gimnasia del espíritu y una preparación para la filosofía.", author: "Isócrates" },
  { quote: "Sin matemáticas no se puede penetrar hasta el fondo de la filosofía.", author: "Leibniz" },
  { quote: "La esencia de las matemáticas reside en su libertad.", author: "Georg Cantor" }
];

const VerifyingAnswerModal = ({ isOpen }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Cambiar la frase cada 5 segundos
    const interval = setInterval(() => {
      setFade(false);
      
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % mathematicianQuotes.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setCurrentQuoteIndex(0);
      setFade(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuote = mathematicianQuotes[currentQuoteIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        {/* Spinner animado */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-20 h-20">
            {/* Círculo exterior girando */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            {/* Círculo interior girando en sentido contrario */}
            <div className="absolute inset-2 border-4 border-green-200 rounded-full animate-spin-reverse border-t-green-600"></div>
            {/* Icono central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Texto principal */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Verificando respuesta...
        </h3>
        <p className="text-gray-600 mb-8">
          Estamos analizando tu solución con nuestra IA
        </p>

        {/* Barra de progreso animada */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 animate-progress"></div>
          </div>
        </div>

        {/* Frase de matemático con animación de fade */}
        <div className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-100">
            <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">
              "{currentQuote.quote}"
            </p>
            <p className="text-blue-600 font-medium text-sm">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        {/* Puntos animados */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VerifyingAnswerModal;
