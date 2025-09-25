import React, { useState, useRef, useEffect } from 'react';

const Select = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Seleccionar...', 
  className = '',
  disabled = false,
  error = false,
  valueKey = 'value',
  labelKey = 'label',
  sublabelKey = 'sublabel',
  isLoading = false,
  searchable = false,
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = searchable 
    ? options.filter(option => 
        option[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option[sublabelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option[valueKey] === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option) => {
    onChange({ target: { name, value: option[valueKey] } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const baseClasses = `
    relative w-full cursor-pointer rounded-lg border bg-white px-3 py-2 text-left
    shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
    ${error ? 'border-red-300 focus:border-red-300 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="relative" ref={selectRef}>
      <div
        className={baseClasses}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id={id}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">Cargando...</span>
              </div>
            ) : selectedOption ? (
              <div>
                <div className="text-gray-900 font-medium truncate">
                  {selectedOption[labelKey]}
                </div>
                {selectedOption[sublabelKey] && (
                  <div className="text-sm text-gray-500 truncate">
                    {selectedOption[sublabelKey]}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                {searchTerm ? 'No se encontraron ejercicios' : 'No hay ejercicios disponibles'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors hover:bg-blue-50
                    ${value === option[valueKey] ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                  `}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={value === option[valueKey]}
                >
                  <div className="font-medium">{option[labelKey]}</div>
                  {option[sublabelKey] && (
                    <div className="text-sm text-gray-500 mt-1">
                      Tema: {option[sublabelKey]}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;