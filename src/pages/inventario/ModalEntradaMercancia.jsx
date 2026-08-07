import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getProductos, getProveedores, registrarEntrada } from '../../api/inventario'
import { formatCOP } from '../../utils/formato'
import { X, Plus, Trash2 } from 'lucide-react'

export default function ModalEntradaMercancia({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    proveedorId: '',
    numeroFacturaProveedor: '',
    notas: '',
  })
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  const { data: productosData } = useQuery({
    queryKey: ['productos', 0],
    queryFn: () => getProductos(0, 100).then((r) => r.data.datos.content),
  })
  const productos = productosData || []

  const { data: proveedoresData } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => getProveedores().then((r) => r.data.datos),
  })
  const proveedores = proveedoresData || []

  const { mutate, isPending } = useMutation({
    mutationFn: registrarEntrada,
    onSuccess,
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al registrar entrada'),
  })

  const agregarItem = () => {
    setItems([...items, { productoId: '', cantidad: 1, costoUnitarioConIva: '' }])
  }

  const actualizarItem = (index, campo, valor) => {
    setItems(items.map((item, i) =>
      i === index ? { ...item, [campo]: valor } : item
    ))
  }

  const quitarItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalEntrada = items.reduce((sum, item) => {
    return sum + (Number(item.costoUnitarioConIva) * Number(item.cantidad) || 0)
  }, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (items.length === 0) {
      setError('Agrega al menos un producto')
      return
    }
    const itemsInvalidos = items.some(
      (i) => !i.productoId || !i.cantidad || !i.costoUnitarioConIva
    )
    if (itemsInvalidos) {
      setError('Todos los items deben tener producto, cantidad y costo')
      return
    }
    mutate({
      ...form,
      proveedorId: form.proveedorId ? Number(form.proveedorId) : null,
      items: items.map((i) => ({
        productoId: Number(i.productoId),
        cantidad: Number(i.cantidad),
        costoUnitarioConIva: Number(i.costoUnitarioConIva),
      })),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Entrada de mercancía</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Datos generales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select
                value={form.proveedorId}
                onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Factura proveedor</label>
              <input
                type="text"
                value={form.numeroFacturaProveedor}
                onChange={(e) => setForm({ ...form, numeroFacturaProveedor: e.target.value })}
                placeholder="Ej: FAC-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input
              type="text"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Observaciones opcionales"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Productos</p>
              <button
                type="button"
                onClick={agregarItem}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} /> Agregar producto
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-lg">
                Agrega productos a la entrada
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select
                        value={item.productoId}
                        onChange={(e) => actualizarItem(index, 'productoId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (Stock: {p.stockActual})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        placeholder="Costo unitario"
                        value={item.costoUnitarioConIva}
                        onChange={(e) => actualizarItem(index, 'costoUnitarioConIva', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => quitarItem(index)}>
                        <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm font-semibold text-gray-600">Total entrada</span>
              <span className="text-lg font-bold text-green-700">{formatCOP(totalEntrada)}</span>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isPending ? 'Registrando...' : 'Registrar entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}