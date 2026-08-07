import api from './axios'

export const getEntradas = (pagina = 0) =>
  api.get(`/inventario/entradas?page=${pagina}&size=20`)

export const registrarEntrada = (datos) =>
  api.post('/inventario/entradas', datos)

export const getProveedores = () =>
  api.get('/inventario/proveedores')

export const crearProveedor = (datos) =>
  api.post('/inventario/proveedores', datos)

export const actualizarProveedor = (id, datos) =>
  api.put(`/inventario/proveedores/${id}`, datos)

export const desactivarProveedor = (id) =>
  api.delete(`/inventario/proveedores/${id}`)

export const getCreditosProveedor = () =>
  api.get('/inventario/creditos-proveedor')

export const crearCreditoProveedor = (datos) =>
  api.post('/inventario/creditos-proveedor', datos)

export const registrarPagoProveedor = (id, datos) =>
  api.post(`/inventario/creditos-proveedor/${id}/pagos`, datos)