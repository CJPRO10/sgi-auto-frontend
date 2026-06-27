import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClientes, buscarClientes, eliminarCliente } from '../../api/clientes'
import { formatCOP } from '../../utils/formato'
import { Search, Plus, Trash2, Edit2, Star, CreditCard, AlertTriangle } from 'lucide-react'
import ModalCrearCliente from './ModalCrearCliente'

export default function Clientes() {
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: busqueda.length >= 2
      ? ['clientes-busqueda', busqueda]
      : ['clientes', pagina],
    queryFn: () =>
      busqueda.length >= 2
        ? buscarClientes(busqueda).then((r) => ({ content: r.data.datos, totalPages: 1 }))
        : getClientes(pagina).then((r) => r.data.datos),
    keepPreviousData: true,
  })

  const { mutate: eliminar } = useMutation({
    mutationFn: eliminarCliente,
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes'])
    },
  })

  const clientes = data?.content || []
  const totalPaginas = data?.totalPages || 1

  const handleEditar = (cliente) => {
    setClienteEditando(cliente)
    setModalAbierto(true)
  }

  const handleNuevo = () => {
    setClienteEditando(null)
    setModalAbierto(true)
  }

  const handleEliminar = (id, nombre) => {
    if (confirm(`¿Eliminar al cliente ${nombre}?`)) {
      eliminar(id)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de clientes y fidelización</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, cédula o celular..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(0) }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No se encontraron clientes</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Identificación</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Contacto</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Puntos</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Crédito</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {c.nombreCompleto?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{c.nombreCompleto}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="text-xs text-gray-400 mr-1">{c.tipoIdentificacion}</span>
                    {c.numeroIdentificacion}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{c.celular || '—'}</div>
                    <div className="text-xs text-gray-400">{c.correo || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={14} className="text-yellow-500" />
                      <span className="font-medium">{c.saldoPuntos || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.creditoHabilitado ? (
                      <div className="flex items-center gap-1 text-sm">
                        <CreditCard size={14} className="text-green-500" />
                        <span className="text-green-700 font-medium">
                          {formatCOP(c.cupoCreditoCop)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin crédito</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleEditar(c)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleEliminar(c.id, c.nombreCompleto)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {!busqueda && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={pagina >= totalPaginas - 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <ModalCrearCliente
          cliente={clienteEditando}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            setModalAbierto(false)
            queryClient.invalidateQueries(['clientes'])
          }}
        />
      )}
    </div>
  )
}