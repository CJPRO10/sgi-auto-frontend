import api from './axios'

export const login = (credenciales) =>
  api.post('/autenticacion/ingresar', credenciales)

export const cerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}