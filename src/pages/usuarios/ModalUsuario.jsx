import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { crearUsuario, actualizarPermisos, cambiarContrasena } from '../../api/usuarios'
import { X } from 'lucide-react'

const ROLES = [
  { value: 'DUENO', label: 'Dueño' },
  { value: 'CAJERA', label: 'Cajera' },
  { value: 'MECANICO', label: 'Mecánico' },
]

const PERMISOS = [
  { key: 'puedeAplicarDescuento', label: 'Aplicar descuentos' },
  { key: 'puedeAnularVenta', label: 'Anular ventas' },
  { key: 'puedeCerrarCaja', label: 'Cerrar caja' },
  { key: 'puedeVerReportes', label: 'Ver reportes' },
  { key: 'puedeGestionarCredito', label: 'Gestionar crédito' },
]

export default function ModalUsuario({ usuario, onClose, onSuccess }) {
  const esEdicion = !!usuario
  const [tab, setTab] = useState('info')

  const [form, setForm] = useState({
    nombreCompleto: usuario?.nombreCompleto || '',
    nombreUsuario: usuario?.nombreUsuario || '',
    correo: usuario?.correo || '',
    contrasena: '',
    rol: usuario?.rol || 'CAJERA',
    puedeAplicarDescuento: usuario?.puedeAplicarDescuento || false,
    puedeAnularVenta: usuario?.puedeAnularVenta || false,
    puedeCerrarCaja: usuario?.puedeCerrarCaja || false,
    puedeVerReportes: usuario?.puedeVerReportes || false,
    puedeGestionarCredito: usuario?.puedeGestionarCredito || false,
  })

  const [contrasenaForm, setContrasenaForm] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
  })

  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const { mutate: crear, isPending: creando } = useMutation({
    mutationFn: crearUsuario,
    onSuccess,
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al crear usuario'),
  })

  const { mutate: actualizarP, isPending: actualizando } = useMutation({
    mutationFn: ({ id, datos }) => actualizarPermisos(id, datos),
    onSuccess: () => { setExito('Permisos actualizados'); setError('') },
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al actualizar permisos'),
  })

  const { mutate: cambiarPass, isPending: cambiando } = useMutation({
    mutationFn: ({ id, datos }) => cambiarContrasena(id, datos),
    onSuccess: () => { setExito('Contraseña actualizada'); setError(''); setContrasenaForm({ contrasenaActual: '', contrasenaNueva: '' }) },
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al cambiar contraseña'),
  })

  const handleCrear = (e) => {
    e.preventDefault()
    setError('')
    if (!form.nombreCompleto || !form.nombreUsuario || !form.contrasena) {
      setError('Nombre, usuario y contraseña son obligatorios')
      return
    }
    crear(form)
  }

  const handlePermisos = (e) => {
    e.preventDefault()
    setError('')
    actualizarP({
      id: usuario.id,
      datos: {
        puedeAplicarDescuento: form.puedeAplicarDescuento,
        puedeAnularVenta: form.puedeAnularVenta,
        puedeCerrarCaja: form.puedeCerrarCaja,
        puedeVerReportes: form.puedeVerReportes,
        puedeGestionarCredito: form.puedeGestionarCredito,
      }
    })
  }

  const handleContrasena = (e) => {
    e.preventDefault()
    setError('')
    if (!contrasenaForm.contrasenaActual || !contrasenaForm.contrasenaNueva) {
      setError('Ambos campos son obligatorios')
      return
    }
    cambiarPass({ id: usuario.id, datos: contrasenaForm })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {esEdicion ? usuario.nombreCompleto : 'Nuevo usuario'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {esEdicion && (
          <div className="flex border-b px-6">
            {[
              { key: 'info', label: 'Información' },
              { key: 'permisos', label: 'Permisos' },
              { key: 'contrasena', label: 'Contraseña' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); setExito('') }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">

          {/* Tab info / formulario crear */}
          {(!esEdicion || tab === 'info') && (
            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input type="text" value={form.nombreCompleto}
                  onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input type="text" value={form.nombreUsuario}
                  onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
                  disabled={esEdicion}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input type="email" value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  disabled={esEdicion}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {!esEdicion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña inicial</label>
                  <input type="password" value={form.contrasena}
                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {!esEdicion && (
                <button type="submit" disabled={creando}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {creando ? 'Creando...' : 'Crear usuario'}
                </button>
              )}
            </form>
          )}

          {/* Tab permisos */}
          {esEdicion && tab === 'permisos' && (
            <form onSubmit={handlePermisos} className="space-y-3">
              {usuario.rol !== 'CAJERA' ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Los permisos granulares solo aplican al rol Cajera
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-2">Configura los permisos de {usuario.nombreCompleto}</p>
                  {PERMISOS.map((p) => (
                    <label key={p.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[p.key]}
                        onChange={(e) => setForm({ ...form, [p.key]: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{p.label}</span>
                    </label>
                  ))}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {exito && <p className="text-green-600 text-sm">{exito}</p>}
                  <button type="submit" disabled={actualizando}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {actualizando ? 'Guardando...' : 'Guardar permisos'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Tab contraseña */}
          {esEdicion && tab === 'contrasena' && (
            <form onSubmit={handleContrasena} className="space-y-3">
              <p className="text-sm text-gray-500">Cambiar contraseña de {usuario.nombreCompleto}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                <input type="password" value={contrasenaForm.contrasenaActual}
                  onChange={(e) => setContrasenaForm({ ...contrasenaForm, contrasenaActual: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña nueva</label>
                <input type="password" value={contrasenaForm.contrasenaNueva}
                  onChange={(e) => setContrasenaForm({ ...contrasenaForm, contrasenaNueva: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {exito && <p className="text-green-600 text-sm">{exito}</p>}
              <button type="submit" disabled={cambiando}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {cambiando ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}