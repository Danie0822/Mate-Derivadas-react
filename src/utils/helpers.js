// Utilidades para formatear datos
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Utilidad para validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utilidad para capitalizar primera letra
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Utilidad para formatear nombres
export const formatName = (name) => {
  return name
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// Utilidad para truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Utilidad para generar clases de CSS condicionales
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
