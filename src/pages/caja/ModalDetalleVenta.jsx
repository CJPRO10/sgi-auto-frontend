import { useQuery } from '@tanstack/react-query'
import { getVentaPorId } from '../../api/pos'
import { formatCOP, formatFecha } from '../../utils/formato'
import { X, Package, ShoppingCart } from 'lucide-react'

export default function ModalDetalleVenta({ ventaId, onClose }) {
  const { data: venta, isLoading } = useQuery({
    queryKey: ['venta-detalle', ventaId],
    queryFn: () => getVentaPorId(ventaId).then((r) => r.data.datos),
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Venta #{ventaId}
              </h2>
              {venta && <p className="text-sm text-gray-400">{formatFecha(venta.creadoEn)}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : venta && (
            <>
              {/* Info general */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Cliente</p>
                  <p className="font-medium">{venta.nombreCliente || 'Ocasional'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Método de pago</p>
                  <p className="font-medium">{venta.metodoPago}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Estado</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    venta.estado === 'COMPLETADA'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {venta.estado}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Puntos ganados</p>
                  <p className="font-medium text-yellow-600">⭐ {venta.puntosGanados}</p>
                </div>
              </div>

              {/* Productos */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Productos vendidos
                </p>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-3 py-2">Producto</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase px-3 py-2">Cant.</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-3 py-2">Precio</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-3 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {venta.items?.map((item) => (
                      <tr key={item.productoId} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Package size={13} className="text-indigo-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.nombreProducto}</p>
                              <p className="text-xs text-gray-400 font-mono">{item.codigoProducto}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center text-sm">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right text-sm">{formatCOP(item.precioUnitarioCop)}</td>
                        <td className="px-3 py-2 text-right text-sm font-medium">{formatCOP(item.subtotalCop)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCOP(venta.subtotalCop)}</span>
                </div>
                {venta.descuentoCop > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento</span>
                    <span>-{formatCOP(venta.descuentoCop)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>{formatCOP(venta.totalCop)}</span>
                </div>
                {venta.vueltoCop > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Vuelto</span>
                    <span>{formatCOP(venta.vueltoCop)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}