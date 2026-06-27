import api from './axios'

export const getProductos = (pagina = 0, tamano = 20) =>
  api.get(`/inventario/productos?page=${pagina}&size=${tamano}`)

export const buscarProductos = (termino) =>
  api.get(`/inventario/productos/buscar?q=${termino}`)

export const crearProducto = (datos) =>
  api.post('/inventario/productos', datos)

export const actualizarProducto = (id, datos) =>
  api.put(`/inventario/productos/${id}`, datos)

export const eliminarProducto = (id) =>
  api.delete(`/inventario/productos/${id}`)

export const getCategorias = () =>
  api.get('/inventario/categorias')

export const ajustarStock = (id, datos) =>
  api.post(`/inventario/productos/${id}/ajustar-stock`, datos)