import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { cambiarEstado, agregarServicio, agregarRepuesto } from '../../api/taller'
import { getProductos } from '../../api/inventario'
import { formatCOP, formatFecha } from '../../utils/formato'
import { X, ChevronRight, Plus } from 'lucide-react'

const ESTADOS_SIGUIENTES = {
  RECIBIDO: 'EN_DIAGNOSTICO',
  EN_DIAGNOSTICO: 'EN_REPARACION',
  EN_REPARACION: 'LISTO',
  ESPERANDO_REPUESTO: 'EN_REPARACION',
  LISTO: 'ENTREGADO',
}

const LABELS = {
  RECIBIDO: 'Iniciar diagnóstico',
  EN_DIAGNOSTICO: 'Iniciar reparación',
  EN_REPARACION: 'Marcar listo',
  ESPERANDO_REPUESTO: 'Reanudar reparación',
  LISTO: 'Marcar entregado',
}

export default function ModalDetalleOT({ ot, onClose, onCambioEstado }) {
  const [tabActiva, setTabActiva] = useState('info')
  const [formServicio, setFormServicio] = useState({ descripcion: '', cantidad: 1, precioUnitarioCop: '' })
  const [formRepuesto, setFormRepuesto] = useState({ productoId: '', cantidad: 1 })
  const [errorServicio, setErrorServicio] = useState('')
  const [errorRepuesto, setErrorRepuesto] = useState('')

  const siguienteEstado = ESTADOS_SIGUIENTES[ot.estado]

  const { mutate: avanzar, isPending: avanzando } = useMutation({
    mutationFn: () => cambiarEstado(ot.id, siguienteEstado),
    onSuccess: onCambioEstado,
  })

  const { mutate: addServicio, isPending: guardandoServicio } = useMutation({
    mutationFn: (datos) => agregarServicio(ot.id, datos),
    onSuccess: () => {
      setFormServicio({ descripcion: '', cantidad: 1, precioUnitarioCop: '' })
      setErrorServicio('')
      onCambioEstado()
    },
    onError: (err) => setErrorServicio(err.response?.data?.mensaje || 'Error al agregar servicio'),
  })

  const { mutate: addRepuesto, isPending: guardandoRepuesto } = useMutation({
    mutationFn: (datos) => agregarRepuesto(ot.id, datos),
    onSuccess: () => {
      setFormRepuesto({ productoId: '', cantidad: 1 })
      setErrorRepuesto('')
      onCambioEstado()
    },
    onError: (err) => setErrorRepuesto(err.response?.data?.mensaje || 'Error al agregar repuesto'),
  })

  const { data: productosData } = useQuery({
    queryKey: ['productos', 0],
    queryFn: () => getProductos(0, 100).then((r) => r.data.datos.content),
    staleTime: 0,
    refetchOnMount: true,
  })
  const productos = productosData?.content || []

  const handleServicio = (e) => {
    e.preventDefault()
    if (!formServicio.descripcion || !formServicio.precioUnitarioCop) {
      setErrorServicio('Descripción y precio son obligatorios')
      return
    }
    addServicio({
      descripcion: formServicio.descripcion,
      cantidad: Number(formServicio.cantidad),
      precioUnitarioCop: Number(formServicio.precioUnitarioCop),
    })
  }

  const handleRepuesto = (e) => {
    e.preventDefault()
    if (!formRepuesto.productoId) {
      setErrorRepuesto('Selecciona un producto')
      return
    }
    const producto = productos.find((p) => String(p.id) === String(formRepuesto.productoId))
    addRepuesto({
      productoId: Number(formRepuesto.productoId),
      cantidad: Number(formRepuesto.cantidad),
      precioUnitarioCop: producto?.precioVentaDetal || 0,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">OT #{ot.id}</h2>
            <p className="text-sm text-gray-400">{ot.placa} — {ot.nombreCliente}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {['info', 'servicios', 'repuestos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                tabActiva === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' ? 'Información' : tab === 'servicios' ? 'Servicios' : 'Repuestos'}
            </button>
          ))}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Tab Info */}
          {tabActiva === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Cliente</p>
                  <p className="font-medium">{ot.nombreCliente}</p>
                  <p className="text-gray-500">{ot.celularCliente || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Vehículo</p>
                  <p className="font-medium">{ot.placa}</p>
                  <p className="text-gray-500">
                    {[ot.marcaVehiculo, ot.modeloVehiculo, ot.anioVehiculo].filter(Boolean).join(' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Problema</p>
                  <p className="font-medium">{ot.descripcionProblema}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Mecánico</p>
                  <p className="font-medium">{ot.mecanicoNombre || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Ingreso</p>
                  <p className="font-medium">{formatFecha(ot.creadoEn)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Entrega prometida</p>
                  <p className="font-medium">{ot.fechaPrometidaEntrega ? formatFecha(ot.fechaPrometidaEntrega) : '—'}</p>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Servicios</span>
                  <span>{formatCOP(ot.totalServiciosCop)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Repuestos</span>
                  <span>{formatCOP(ot.totalRepuestosCop)}</span>
                </div>
                {ot.descuentoCop > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento</span>
                    <span>-{formatCOP(ot.descuentoCop)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCOP(ot.granTotalCop)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Servicios */}
          {tabActiva === 'servicios' && (
            <div className="space-y-4">
              {/* Lista servicios existentes */}
              {ot.servicios?.length > 0 ? (
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                  {ot.servicios.map((s) => (
                    <div key={s.id} className="flex justify-between items-center px-4 py-3 text-sm">
                      <span>{s.descripcion} x{s.cantidad}</span>
                      <span className="font-medium">{formatCOP(s.subtotalCop)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No hay servicios agregados</p>
              )}

              {/* Formulario agregar servicio */}
              {ot.estado !== 'ENTREGADO' && ot.estado !== 'CANCELADO' && (
                <form onSubmit={handleServicio} className="border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Agregar servicio</p>
                  <input
                    type="text"
                    placeholder="Descripción del servicio"
                    value={formServicio.descripcion}
                    onChange={(e) => setFormServicio({ ...formServicio, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Cantidad"
                      min="1"
                      value={formServicio.cantidad}
                      onChange={(e) => setFormServicio({ ...formServicio, cantidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Precio unitario (COP)"
                      value={formServicio.precioUnitarioCop}
                      onChange={(e) => setFormServicio({ ...formServicio, precioUnitarioCop: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errorServicio && <p className="text-red-500 text-xs">{errorServicio}</p>}
                  <button
                    type="submit"
                    disabled={guardandoServicio}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <Plus size={14} />
                    {guardandoServicio ? 'Guardando...' : 'Agregar servicio'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab Repuestos */}
          {tabActiva === 'repuestos' && (
            <div className="space-y-4">
              {/* Lista repuestos existentes */}
              {ot.repuestos?.length > 0 ? (
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                  {ot.repuestos.map((r) => (
                    <div key={r.id} className="flex justify-between items-center px-4 py-3 text-sm">
                      <span>{r.nombreRepuesto} x{r.cantidad}</span>
                      <span className="font-medium">{formatCOP(r.subtotalCop)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No hay repuestos agregados</p>
              )}

              {/* Formulario agregar repuesto */}
              {ot.estado !== 'ENTREGADO' && ot.estado !== 'CANCELADO' && (
                <form onSubmit={handleRepuesto} className="border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Agregar repuesto</p>
                  <select
                    value={formRepuesto.productoId}
                    onChange={(e) => setFormRepuesto({ ...formRepuesto, productoId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — Stock: {p.stockActual} — {formatCOP(p.precioVentaDetal)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    min="1"
                    value={formRepuesto.cantidad}
                    onChange={(e) => setFormRepuesto({ ...formRepuesto, cantidad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errorRepuesto && <p className="text-red-500 text-xs">{errorRepuesto}</p>}
                  <button
                    type="submit"
                    disabled={guardandoRepuesto}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <Plus size={14} />
                    {guardandoRepuesto ? 'Guardando...' : 'Agregar repuesto'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer — avanzar estado */}
        {siguienteEstado && (
          <div className="p-6 border-t">
            <button
              onClick={() => avanzar()}
              disabled={avanzando}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <ChevronRight size={16} />
              {LABELS[ot.estado]}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}