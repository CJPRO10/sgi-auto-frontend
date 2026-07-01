import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, buscarProductos } from '../../api/inventario'
import { getClientes } from '../../api/clientes'
import { crearVenta } from '../../api/pos'
import { formatCOP } from '../../utils/formato'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Package } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'CREDITO', label: 'Crédito' },
  { value: 'MIXTO', label: 'Mixto' },
]

function generarUUID() {
  return crypto.randomUUID()
}

export default function Pos() {
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [nombreAnonimo, setNombreAnonimo] = useState('')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [montoPagado, setMontoPagado] = useState('')
  const [mensajeExito, setMensajeExito] = useState(null)
  const [error, setError] = useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const { data: productosData } = useQuery({
    queryKey: debouncedBusqueda.length >= 2 ? ['productos-busqueda', debouncedBusqueda] : ['productos', 0],
    queryFn: () =>
      debouncedBusqueda.length >= 2
        ? buscarProductos(debouncedBusqueda).then((r) => r.data.datos)
        : getProductos(0, 50).then((r) => r.data.datos.content),
  })
  const productos = productosData || []

  const { data: clientesData } = useQuery({
    queryKey: ['clientes', 0],
    queryFn: () => getClientes(0, 100).then((r) => r.data.datos),
  })
  const clientes = clientesData?.content || []

  const subtotal = useMemo(
    () => carrito.reduce((sum, item) => sum + item.precioUnitarioCop * item.cantidad, 0),
    [carrito]
  )

  const { mutate: registrarVenta, isPending } = useMutation({
    mutationFn: crearVenta,
    onSuccess: (res) => {
      setMensajeExito(res.data.datos)
      setCarrito([])
      setClienteId('')
      setNombreAnonimo('')
      setMontoPagado('')
      setError('')
      queryClient.invalidateQueries(['productos'])
      queryClient.invalidateQueries(['dashboard'])
    },
    onError: (err) => {
      setError(err.response?.data?.mensaje || 'Error al procesar la venta')
    },
  })

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.productoId === producto.id)
      if (existe) {
        if (existe.cantidad >= producto.stockActual) return prev
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precioUnitarioCop: producto.precioVentaDetal,
          cantidad: 1,
          stockDisponible: producto.stockActual,
        },
      ]
    })
  }

  const cambiarCantidad = (productoId, delta) => {
    setCarrito((prev) =>
      prev
        .map((i) => {
          if (i.productoId !== productoId) return i
          const nuevaCantidad = i.cantidad + delta
          if (nuevaCantidad < 1) return i
          if (nuevaCantidad > i.stockDisponible) return i
          return { ...i, cantidad: nuevaCantidad }
        })
        .filter(Boolean)
    )
  }

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((i) => i.productoId !== productoId))
  }

  const handleCobrar = () => {
    setError('')
    if (carrito.length === 0) {
      setError('Agrega al menos un producto')
      return
    }
    registrarVenta({
      claveIdempotencia: generarUUID(),
      clienteId: clienteId ? Number(clienteId) : null,
      nombreClienteAnonimo: clienteId ? null : (nombreAnonimo || 'Cliente general'),
      metodoPago,
      montoPagadoCop: montoPagado ? Number(montoPagado) : subtotal,
      items: carrito.map((i) => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitarioCop: i.precioUnitarioCop,
      })),
    })
  }

  return (
    <div className="flex h-full">
      {/* Columna izquierda: productos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Punto de Venta</h1>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {productos.map((p) => (
            <button
              key={p.id}
              onClick={() => agregarAlCarrito(p)}
              disabled={p.stockActual === 0}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <Package size={16} className="text-indigo-600" />
              </div>
              <p className="font-medium text-sm text-gray-800 truncate">{p.nombre}</p>
              <p className="text-xs text-gray-400 mb-2">Stock: {p.stockActual}</p>
              <p className="font-semibold text-blue-600">{formatCOP(p.precioVentaDetal)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Columna derecha: carrito */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={18} className="text-gray-600" />
            <h2 className="font-semibold text-gray-800">Carrito</h2>
            <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {carrito.length} {carrito.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {carrito.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Carrito vacío</p>
          ) : (
            carrito.map((item) => (
              <div key={item.productoId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-800 flex-1">{item.nombre}</p>
                  <button onClick={() => quitarDelCarrito(item.productoId)}>
                    <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.productoId, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.productoId, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCOP(item.precioUnitarioCop * item.cantidad)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: cliente, pago, total */}
        <div className="p-4 border-t space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Cliente ocasional</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombreCompleto}</option>
              ))}
            </select>
          </div>

          {!clienteId && (
            <input
              type="text"
              placeholder="Nombre cliente (opcional)"
              value={nombreAnonimo}
              onChange={(e) => setNombreAnonimo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Método de pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Monto pagado (opcional)</label>
            <input
              type="number"
              placeholder={String(subtotal)}
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center py-2 border-t">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-800">{formatCOP(subtotal)}</span>
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleCobrar}
            disabled={isPending || carrito.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Procesando...' : 'Cobrar'}
          </button>
        </div>
      </div>

      {/* Modal éxito */}
      {mensajeExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Venta registrada</h3>
            <p className="text-gray-500 text-sm mb-4">Total: {formatCOP(mensajeExito.totalCop)}</p>
            {mensajeExito.vueltoCop > 0 && (
              <p className="text-gray-700 font-medium mb-4">
                Vuelto: {formatCOP(mensajeExito.vueltoCop)}
              </p>
            )}
            <button
              onClick={() => setMensajeExito(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}