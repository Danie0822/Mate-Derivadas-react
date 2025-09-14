# Mate Derivadas React

Una aplicación moderna de React para el cálculo y estudio de derivadas matemáticas. Construida con las mejores prácticas de desarrollo frontend y una arquitectura escalable.

## 🚀 Características

- **Autenticación JWT**: Sistema completo de login con validaciones
- **UI Moderna**: Diseñada con TailwindCSS y componentes reutilizables
- **Validaciones**: Formularios validados con react-hook-form y Yup
- **Rutas Protegidas**: Sistema de navegación con rutas públicas y privadas
- **Estado Global**: Manejo centralizado con Context API
- **API Centralizada**: Servicios organizados con Axios e interceptores
- **Responsive**: Diseño adaptable a cualquier dispositivo

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Estilo**: TailwindCSS
- **Rutas**: React Router DOM
- **Formularios**: React Hook Form + Yup
- **HTTP Client**: Axios
- **Estado**: Context API + useReducer

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base (Button, Input, Card)
│   └── layout/          # Componentes de layout (Header, Layout)
├── pages/               # Páginas de la aplicación
├── context/             # Contextos de React (AuthContext)
├── hooks/               # Hooks personalizados
├── services/            # Servicios API y utilidades HTTP
├── schemas/             # Esquemas de validación con Yup
├── utils/               # Funciones de utilidad
└── index.css           # Estilos globales con TailwindCSS
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd mate-derivadas-react
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   VITE_API_URL=http://localhost:3000
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

## 🔐 Autenticación

### Credenciales de prueba
- **Email**: ale@gmail.com
- **Contraseña**: Clave123!

### API Endpoint
El sistema realiza autenticación contra:
```
POST http://localhost:3000/auth/login
```

**Payload de solicitud:**
```json
{
  "email": "ale@gmail.com",
  "password": "Clave123!"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "route": "/auth/login",
  "message": "User logged in",
  "data": {
    "token": "string",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "ale@gmail.com",
      "full_name": "Daniel Morales",
      "rol": "admin"
    }
  }
}
```

## 🏗️ Arquitectura

### Servicios API
Todos los servicios HTTP están centralizados en `src/services/api.js`:
- **Interceptores JWT**: Envío automático del token en cada solicitud
- **Manejo de errores**: Redirección automática en caso de token expirado
- **CRUD genérico**: Funciones reutilizables para operaciones HTTP

### Estado Global
Utiliza Context API con useReducer para manejar:
- Estado de autenticación del usuario
- Información del usuario logueado
- Estados de carga y error

### Componentes UI
Librería de componentes reutilizables:
- **Button**: Múltiples variantes y estados
- **Input**: Con validaciones y mostrar/ocultar contraseña
- **Card**: Sistema de tarjetas con header, content y footer

### Validaciones
Esquemas de validación robustos con Yup:
- Validación de email
- Validación de contraseñas seguras
- Mensajes de error personalizados en español

## 🎯 Características de Seguridad

- **JWT Storage**: Tokens almacenados en localStorage
- **Auto-logout**: Cierre de sesión automático en tokens expirados
- **Rutas protegidas**: Acceso restringido según estado de autenticación
- **Validación client-side**: Validaciones inmediatas en formularios

## 🚦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Preview de la build
npm run preview

# Linting
npm run lint
```

## 🎨 Personalización

### TailwindCSS
El proyecto incluye una configuración personalizada de TailwindCSS con:
- Paleta de colores primary personalizada
- Fuente Inter como tipografía principal
- Componentes CSS personalizados para botones e inputs

### Temas
Los colores y estilos pueden modificarse en:
- `tailwind.config.js`: Configuración de TailwindCSS
- `src/index.css`: Estilos globales y componentes CSS

## 📱 Responsive Design

La aplicación está diseñada para ser completamente responsive:
- **Mobile**: Diseño optimizado para dispositivos móviles
- **Tablet**: Layout adaptado para tablets
- **Desktop**: Experiencia completa en escritorio

## 🔄 Estado de Loading

Implementa estados de carga en:
- Verificación inicial de autenticación
- Proceso de login
- Transiciones entre rutas

## 🛣️ Rutas

| Ruta | Acceso | Descripción |
|------|---------|-------------|
| `/` | Pública | Redirección automática |
| `/login` | Solo no autenticados | Página de inicio de sesión |
| `/dashboard` | Solo autenticados | Panel principal |

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## ✨ Próximas Características

- [ ] Calculadora de derivadas interactiva
- [ ] Gráficos de funciones
- [ ] Historial de cálculos
- [ ] Ejercicios interactivos
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

---

Desarrollado con ❤️ usando React y TailwindCSS+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
