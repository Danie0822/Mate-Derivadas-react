// services/python/health.service.js
import { pythonCrud } from '../api'

const RESOURCE = 'health'

/**
 * Realiza verificación de salud general del sistema
 * @returns {Promise} Promesa que resuelve con información de salud del sistema
 * @example
 * const healthStatus = await checkHealth()
 * // Retorna: { 
 * //   status: "healthy", 
 * //   timestamp: 1640995200.0, 
 * //   version: "1.0.0", 
 * //   uptime: 86400.0,
 * //   system: { 
 * //     cpu_percent: 15.5, 
 * //     memory_percent: 45.2, 
 * //     disk_percent: 68.7 
 * //   } 
 * // }
 */
export const checkHealth = () => pythonCrud.get(`/${RESOURCE}`)

/**
 * Verifica si el sistema está listo para recibir tráfico
 * @returns {Promise} Promesa que resuelve con estado de preparación
 * @example
 * const readinessStatus = await checkReadiness()
 * // Retorna: { status: "ready", timestamp: 1640995200.0 }
 * // o: { status: "not ready", error: "Database connection failed", timestamp: 1640995200.0 }
 */
export const checkReadiness = () => pythonCrud.get(`/${RESOURCE}/ready`)

/**
 * Verifica si la aplicación está viva (para Kubernetes liveness probe)
 * @returns {Promise} Promesa que resuelve con estado de vida de la aplicación
 * @example
 * const livenessStatus = await checkLiveness()
 * // Retorna: { status: "alive", timestamp: 1640995200.0 }
 */
export const checkLiveness = () => pythonCrud.get(`/${RESOURCE}/live`)

/**
 * Obtiene información completa del estado del sistema
 * @returns {Promise} Promesa que resuelve con información detallada del sistema
 * @example
 * const systemInfo = await getSystemInfo()
 * // Combina health, readiness y liveness en una sola respuesta
 */
export const getSystemInfo = async () => {
  try {
    const [health, readiness, liveness] = await Promise.allSettled([
      checkHealth(),
      checkReadiness(), 
      checkLiveness()
    ])
    
    return {
      health: health.status === 'fulfilled' ? health.value : { status: 'error', error: health.reason?.message },
      readiness: readiness.status === 'fulfilled' ? readiness.value : { status: 'error', error: readiness.reason?.message },
      liveness: liveness.status === 'fulfilled' ? liveness.value : { status: 'error', error: liveness.reason?.message },
      overall_status: health.status === 'fulfilled' && health.value.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: Date.now() / 1000
    }
  } catch (error) {
    return {
      health: { status: 'error', error: error.message },
      readiness: { status: 'error', error: error.message },
      liveness: { status: 'error', error: error.message },
      overall_status: 'error',
      timestamp: Date.now() / 1000
    }
  }
}