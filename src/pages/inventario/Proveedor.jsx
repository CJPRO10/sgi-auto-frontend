import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProveedores, crearProveedor, actualizarProveedor, desactivarProveedor } from '../../api/inventario'
import { Plus, Edit2, UserX, Truck } from 'lucide-react'
import ModalProveedor from './ModalProveedor'

export default function Proveedores() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => getProveedores().then((r) => r.data.datos),
  })
  const proveedores = data || []

  const { mutate: desactivar } = useMutation({
    mutationFn: desactivarProveedor,
    onSuccess: () => queryClient.invalidateQueries(['proveedores']),
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de proveedores del almacén</p>
        </div>
        <button
          onClick={() => { setProveedorEditando(null); setModalAbierto(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Nuevo proveedor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : proveedores.length === 0 ? (
          <div className="text-center py-16">
            <Truck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay proveedores registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Proveedor</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">NIT</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Contacto</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Teléfono</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proveedores.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{p.nombre}</p>
                    {p.correo && <p className="text-xs text-gray-400">{p.correo}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.nit || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.personaContacto || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.telefono || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setProveedorEditando(p); setModalAbierto(true) }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => confirm(`¿Desactivar a ${p.nombre}?`) && desactivar(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <UserX size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ModalProveedor
          proveedor={proveedorEditando}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            setModalAbierto(false)
            queryClient.invalidateQueries(['proveedores'])
          }}
        />
      )}
    </div>
  )
}