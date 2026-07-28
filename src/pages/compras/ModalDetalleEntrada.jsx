import { useQuery } from '@tanstack/react-query'
import { formatCOP, formatFecha } from '../../utils/formato'
import { X, Package } from 'lucide-react'
import api from '../../api/axios'

const getEntradaDetalle = (id) =>
  api.get(`/inventario/entradas/${id}`).then((r) => r.data.datos)

export default function ModalDetalleEntrada({ entrada, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['entrada-detalle', entrada.id],
    queryFn: () => getEntradaDetalle(entrada.id),
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Entrada #{entrada.id}</h2>
            <p className="text-sm text-gray-400">
              {entrada.proveedorNombre || 'Sin proveedor'} — {formatFecha(entrada.creadoEn)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Proveedor</p>
                  <p className="font-medium">{data?.proveedorNombre || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">N° Factura</p>
                  <p className="font-medium">{data?.numeroFacturaProveedor || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Registrado por</p>
                  <p className="font-medium">{data?.registradoPor || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Fecha</p>
                  <p className="font-medium">{formatFecha(data?.creadoEn)}</p>
                </div>
                {data?.notas && (
                  <div className="col-span-2">
                    <p className="text-gray-400 mb-1">Notas</p>
                    <p className="font-medium">{data.notas}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Productos ingresados</p>
                {data?.items?.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin items</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Producto</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Código</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">Cantidad</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2">Costo unit.</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data?.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-indigo-500" />
                              <span className="text-sm font-medium text-gray-800">{item.productoNombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{item.productoCodigo}</td>
                          <td className="px-4 py-3 text-center text-sm font-semibold">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right text-sm">{formatCOP(item.costoUnitarioConIva)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold">{formatCOP(item.subtotalCop)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-gray-200">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total entrada</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-700">{formatCOP(data?.costoTotalCop)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}