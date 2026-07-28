import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategorias } from '../../api/inventario'
import { Plus, Trash2, Tag } from 'lucide-react'
import api from '../../api/axios'

const crearCategoria = (datos) => api.post('/inventario/categorias', datos)
const desactivarCategoria = (id) => api.delete(`/inventario/categorias/${id}`)

export default function Categorias() {
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => getCategorias().then((r) => r.data.datos),
  })
  const categorias = data || []

  const { mutate: crear, isPending: creando } = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias'])
      setNombre('')
      setDescripcion('')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al crear categoría'),
  })

  const { mutate: desactivar } = useMutation({
    mutationFn: desactivarCategoria,
    onSuccess: () => queryClient.invalidateQueries(['categorias']),
  })

  const handleCrear = (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    crear({ nombre: nombre.trim(), descripcion: descripcion.trim() || null })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <p className="text-gray-500 text-sm mt-1">Gestión de categorías de productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Nueva categoría</h2>
          <form onSubmit={handleCrear} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Eléctrico, Frenos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={creando}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Plus size={14} />
              {creando ? 'Creando...' : 'Crear categoría'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-16">
              <Tag size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No hay categorías registradas</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Nombre</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Descripción</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categorias.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-blue-500" />
                        <span className="font-medium text-gray-800 text-sm">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.descripcion || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => confirm(`¿Desactivar categoría "${c.nombre}"?`) && desactivar(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}