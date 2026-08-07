import api from './axios'

export const getCajaActual = () => api.get('/caja/actual')
export const getSesionesAbiertas = () => api.get('/caja/sesiones-abiertas')
export const abrirCaja = (datos) => api.post('/caja/abrir', datos)
export const cerrarCaja = (datos) => api.post('/caja/cerrar', datos)
export const registrarGasto = (datos) => api.post('/caja/gastos', datos)
export const getHistorialCaja = (pagina = 0, cajeraId = '', desde = '', hasta = '') =>
  api.get(`/caja/historial?page=${pagina}&size=10${cajeraId ? `&cajeraId=${cajeraId}` : ''}${desde ? `&desde=${desde}` : ''}${hasta ? `&hasta=${hasta}` : ''}`)