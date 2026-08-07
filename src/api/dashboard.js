import api from './axios'

export const getDashboard = () => api.get('/dashboard')
export const getDashboardMecanico = () => api.get('/dashboard/mecanico')