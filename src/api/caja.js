import api from './axios'

export const getCajaActual = () => api.get('/caja/actual')
export const abrirCaja = (datos) => api.post('/caja/abrir', datos)
export const cerrarCaja = (datos) => api.post('/caja/cerrar', datos)
export const registrarGasto = (datos) => api.post('/caja/gastos', datos)
export const getHistorialCaja = (pagina = 0) => api.get(`/caja/historial?page=${pagina}&size=10`)