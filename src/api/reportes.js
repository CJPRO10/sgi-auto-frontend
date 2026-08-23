import api from './axios'

export const getReporteVentas = (desde, hasta) =>
  api.get(`/reportes/ventas?desde=${desde}&hasta=${hasta}`)

export const getReporteInventario = () =>
  api.get('/reportes/inventario')

export const getReporteTaller = () =>
  api.get('/reportes/taller')

export const getListaPrecios = () =>
  api.get('/reportes/lista-precios')

export const getProductosSinMovimiento = (dias = 30) =>
  api.get(`/reportes/productos-sin-movimiento?dias=${dias}`)