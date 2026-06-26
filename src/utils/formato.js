// Formatear moneda colombiana
export const formatCOP = (valor) => {
  if (valor === null || valor === undefined) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor)
}

// Formatear fecha
export const formatFecha = (fecha) => {
  if (!fecha) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

// Formatear fecha solo día
export const formatFechaCorta = (fecha) => {
  if (!fecha) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(fecha))
}