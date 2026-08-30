import api from './axios'

export const ejecutarBackup = () =>
  api.post('/backup/ejecutar')

export const getHistorialBackups = (pagina = 0, tamano = 20) =>
  api.get(`/backup?page=${pagina}&size=${tamano}`)

export const getBackupPorId = (id) =>
  api.get(`/backup/${id}`)

export const getUrlDescargaBackup = (id) =>
  api.get(`/backup/${id}/descargar`)