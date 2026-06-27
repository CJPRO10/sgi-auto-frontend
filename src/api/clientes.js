import api from './axios'

export const getClientes = (pagina = 0, tamano = 20) =>
  api.get(`/clientes?page=${pagina}&size=${tamano}`)

export const buscarClientes = (termino) =>
  api.get(`/clientes/buscar?q=${termino}`)

export const getClientePorId = (id) =>
  api.get(`/clientes/${id}`)

export const crearCliente = (datos) =>
  api.post('/clientes', datos)

export const actualizarCliente = (id, datos) =>
  api.put(`/clientes/${id}`, datos)

export const eliminarCliente = (id) =>
  api.delete(`/clientes/${id}`)