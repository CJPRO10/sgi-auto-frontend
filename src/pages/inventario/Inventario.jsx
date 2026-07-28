import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, buscarProductos, eliminarProducto } from '../../api/inventario'
import { formatCOP } from '../../utils/formato'
import { Search, Plus, Trash2, Edit2, AlertTriangle, Package } from 'lucide-react'
import ModalProducto from './ModalProducto'

function BadgeStock({ stock, minimo }) {
  if (stock === 0)
    return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Agotado</span>
  if (stock <= minimo)
    return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Stock bajo</span>
  return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Normal</span>
}

export default function Inventario() {
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: busqueda.length >= 2
      ? ['productos-busqueda', busqueda]
      : ['productos', pagina],
    queryFn: () =>
      busqueda.length >= 2
        ? buscarProductos(busqueda).then((r) => ({ content: r.data.datos, totalPages: 1 }))
        : getProductos(pagina).then((r) => r.data.datos),
    keepPreviousData: true,
  })

  const { mutate: eliminar } = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => queryClient.invalidateQueries(['productos']),
  })

  const productos = data?.content || []
  const totalPaginas = data?.totalPages || 1

  const handleEditar = (producto) => {
    setProductoEditando(producto)
    setModalAbierto(true)
  }

  const handleNuevo = () => {
    setProductoEditando(null)
    setModalAbierto(true)
  }

  const handleEliminar = (id, nombre) => {
    if (confirm(`¿Desactivar el producto "${nombre}"?`)) eliminar(id)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de productos y stock</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(0) }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No se encontraron productos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Producto</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Código</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Categoría</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Precio venta</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Package size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{p.nombre}</p>
                        {p.descripcion && (
                          <p className="text-xs text-gray-400 truncate max-w-48">{p.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.codigo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.categoriaNombre || '—'}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                    {formatCOP(p.precioVentaDetal)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {p.stockActual <= p.stockMinimo && p.stockActual > 0 && (
                        <AlertTriangle size={14} className="text-yellow-500" />
                      )}
                      <span className={`font-semibold text-sm ${p.stockActual === 0 ? 'text-red-600' : p.stockActual <= p.stockMinimo ? 'text-yellow-600' : 'text-gray-800'}`}>
                        {p.stockActual}
                      </span>
                      <span className="text-xs text-gray-400">/ mín {p.stockMinimo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <BadgeStock stock={p.stockActual} minimo={p.stockMinimo} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEditar(p)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleEliminar(p.id, p.nombre)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {!busqueda && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
            Anterior
          </button>
          <span className="text-sm text-gray-500">Página {pagina + 1} de {totalPaginas}</span>
          <button onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={pagina >= totalPaginas - 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
            Siguiente
          </button>
        </div>
      )}

      {modalAbierto && (
        <ModalProducto
          producto={productoEditando}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            setModalAbierto(false)
            queryClient.invalidateQueries(['productos'])
          }}
        />
      )}
    </div>
  )
}