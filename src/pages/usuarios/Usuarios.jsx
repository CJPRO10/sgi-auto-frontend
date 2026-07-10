import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsuarios, desactivarUsuario, reactivarUsuario } from '../../api/usuarios'
import { Users, Plus, Edit2, UserCheck, UserX } from 'lucide-react'
import ModalUsuario from './ModalUsuario'

const ROLES = {
  DUENO: { label: 'Dueño', color: 'bg-purple-100 text-purple-700' },
  CAJERA: { label: 'Cajera', color: 'bg-blue-100 text-blue-700' },
  MECANICO: { label: 'Mecánico', color: 'bg-yellow-100 text-yellow-700' },
}

export default function Usuarios() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => getUsuarios().then((r) => r.data.datos),
  })
  const usuarios = data || []

  const { mutate: desactivar } = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => queryClient.invalidateQueries(['usuarios']),
  })

  const { mutate: reactivar } = useMutation({
    mutationFn: reactivarUsuario,
    onSuccess: () => queryClient.invalidateQueries(['usuarios']),
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión del equipo de trabajo</p>
        </div>
        <button
          onClick={() => { setUsuarioEditando(null); setModalAbierto(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Usuario</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Rol</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Permisos</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map((u) => {
                const rol = ROLES[u.rol] || { label: u.rol, color: 'bg-gray-100 text-gray-700' }
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {u.nombreCompleto?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.nombreCompleto}</p>
                          <p className="text-xs text-gray-400">@{u.nombreUsuario}</p>
                          {u.correo && <p className="text-xs text-gray-400">{u.correo}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${rol.color}`}>
                        {rol.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.rol === 'CAJERA' ? (
                        <div className="flex flex-wrap gap-1">
                          {u.puedeAplicarDescuento && <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Descuento</span>}
                          {u.puedeAnularVenta && <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Anular</span>}
                          {u.puedeCerrarCaja && <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Cerrar caja</span>}
                          {u.puedeVerReportes && <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Reportes</span>}
                          {u.puedeGestionarCredito && <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Crédito</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.estaActivo
                        ? <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Activo</span>
                        : <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Inactivo</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setUsuarioEditando(u); setModalAbierto(true) }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        {u.estaActivo ? (
                          <button
                            onClick={() => confirm(`¿Desactivar a ${u.nombreCompleto}?`) && desactivar(u.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <UserX size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivar(u.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ModalUsuario
          usuario={usuarioEditando}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            setModalAbierto(false)
            queryClient.invalidateQueries(['usuarios'])
          }}
        />
      )}
    </div>
  )
}