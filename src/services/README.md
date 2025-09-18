# 📋 Servicios API - Documentación

Este proyecto utiliza **dos APIs diferentes** con un sistema unificado de servicios:

## 🏗️ Estructura

```
src/services/
├── api.js                    # ✅ Configuración unificada para ambas APIs
├── node/                     # 🟢 Servicios para API Node.js
│   ├── auth.service.js
│   ├── users.service.js
│   ├── exercises.service.js
│   ├── study-guides.service.js
│   ├── user-exercises.service.js
│   ├── user-progress.service.js
│   └── ai-questions.service.js
└── python/                   # 🐍 Servicios para API Python
    ├── ai-chat.service.js
    ├── embeddings.service.js
    ├── pdf-upload.service.js
    └── health.service.js
```

## ⚙️ Configuración Unificada (`api.js`)

### 🔧 Variables de Entorno
```env
# API Node.js (Backend principal con autenticación)
VITE_NODE_API_URL=http://localhost:3000

# API Python (IA, embeddings, PDF processing)
VITE_PYTHON_API_URL=http://localhost:8000
```

### 📡 Instancias de Axios
- **`nodeApi`**: Para Node.js con JWT automático
- **`pythonApi`**: Para Python sin autenticación, timeout extendido

### 🛠️ Helpers CRUD
- **`crud`**: Para servicios Node.js (extrae `res.data.data`)
- **`pythonCrud`**: Para servicios Python (extrae `res.data`)

## 🔑 Características

### Node.js API
- ✅ Autenticación JWT automática
- ✅ Manejo de errores 401 (logout automático)
- ✅ Estructura de respuesta: `{ success, data: { ... } }`

### Python API  
- ✅ Sin autenticación requerida
- ✅ Timeout extendido para operaciones pesadas
- ✅ Soporte para subida de archivos (`postFile`)
- ✅ Estructura de respuesta directa

## 📝 Ejemplos de Uso

### 🟢 Servicios Node.js
```javascript
import { createUser } from './services/node/users.service'
import { chatWithContext } from './services/node/ai-questions.service'

// Crear usuario (requiere autenticación)
const user = await createUser({
  name: "Juan",
  email: "juan@test.com", 
  password: "123456"
})
```

### 🐍 Servicios Python
```javascript
import { chatWithContext } from './services/python/ai-chat.service'
import { uploadPDF } from './services/python/pdf-upload.service'

// Chat con IA (sin autenticación)
const response = await chatWithContext({
  query: "¿Cómo calcular derivadas?",
  role: "teacher"
})

// Subir PDF
const formData = new FormData()
formData.append('file', pdfFile)
const result = await uploadPDF(formData)
```

## 🎯 Beneficios del Sistema Unificado

1. **DRY (Don't Repeat Yourself)**: Un solo archivo de configuración
2. **Mantenibilidad**: Cambios centralizados
3. **Consistencia**: Misma estructura en todos los servicios
4. **Flexibilidad**: Fácil cambio entre APIs
5. **Claridad**: Separación clara de responsabilidades

## 🚀 Desarrollo

Para agregar nuevos servicios:

1. **Node.js**: Crear en `/services/node/` usando `crud`
2. **Python**: Crear en `/services/python/` usando `pythonCrud`
3. Ambos importan desde `../api` (archivo unificado)