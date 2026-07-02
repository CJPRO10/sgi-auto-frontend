import api from './axios'

export const crearVenta = (datos) => api.post('/ventas', datos)
export const getVentaPorId = (id) => api.get(`/ventas/${id}`)
export const anularVenta = (id, razon) => api.post(`/ventas/${id}/anular`, { razon })
export const getVentasHoy = (pagina = 0) => api.get(`/ventas/hoy?page=${pagina}&size=20`)