import { useQuery } from '@tanstack/react-query'
import { formatCOP, formatFecha } from '../../utils/formato'
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import api from '../../api/axios'
import { useState } from 'react'
import ModalDetalleVenta from './ModalDetalleVenta'

const getSesionPorId = (id) =>
  api.get(`/caja/${id}`).then((r) => r.data.datos)

function FilaMovimiento({ mov }) {
  const [verVenta, setVerVenta] = useState(false)
  const esIngreso = ['VENTA', 'VENTA_EFECTIVO', 'VENTA_TRANSFERENCIA', 'APERTURA', 'ABONO_CREDITO'].includes(mov.tipo)
  const esAnulacion = mov.descripcion?.toLowerCase().includes('anulación') || 
                      mov.descripcion?.toLowerCase().includes('anulacion')
  const esVenta = ['VENTA', 'VENTA_EFECTIVO', 'VENTA_TRANSFERENCIA'].includes(mov.tipo) && mov.ventaId

  return (
    <>
      <div className={`flex items-center justify-between py-2 border-b border-gray-50 last:border-0 ${esAnulacion ? 'bg-red-50' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${esAnulacion ? 'bg-red-200' : esIngreso ? 'bg-green-100' : 'bg-red-100'}`}>
            {esIngreso && !esAnulacion
              ? <TrendingUp size={13} className="text-green-600" />
              : <TrendingDown size={13} className="text-red-600" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-sm font-medium ${esAnulacion ? 'text-red-700' : 'text-gray-700'}`}>
                {mov.descripcion}
              </p>
              {esVenta && !esAnulacion && (
                <button onClick={() => setVerVenta(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 underline">
                  Ver detalle
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {mov.registradoPor && <p className="text-xs text-blue-500">{mov.registradoPor}</p>}
              <p className="text-xs text-gray-400">{formatFecha(mov.creadoEn)}</p>
            </div>
          </div>
        </div>
        <span className={`text-sm font-semibold ${esAnulacion ? 'text-red-700' : esIngreso ? 'text-green-600' : 'text-red-600'}`}>
          {esIngreso && !esAnulacion ? '+' : '-'}{formatCOP(mov.montoCop)}
        </span>
      </div>
      {verVenta && <ModalDetalleVenta ventaId={mov.ventaId} onClose={() => setVerVenta(false)} />}
    </>
  )
}

export default function ModalDetalleSesion({ sesionId, onClose }) {
  const { data: sesion, isLoading } = useQuery({
    queryKey: ['sesion-detalle', sesionId],
    queryFn: () => getSesionPorId(sesionId),
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Detalle de sesión</h2>
            {sesion && <p className="text-sm text-gray-400">{sesion.cajera} — {formatFecha(sesion.abiertaEn)}</p>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sesion && (
            <>
              {/* Resumen general */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Saldo inicial', valor: sesion.saldoInicialCop, color: 'text-gray-800' },
                  { label: 'Total ventas', valor: sesion.totalVentasCop, color: 'text-green-600' },
                  { label: 'Gastos', valor: sesion.totalGastosCop, color: 'text-red-600' },
                  { label: 'Saldo esperado', valor: sesion.saldoEsperadoCop, color: 'text-blue-600' },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                    <p className={`text-lg font-bold ${m.color}`}>{formatCOP(m.valor)}</p>
                  </div>
                ))}
              </div>

              {/* Desglose por método */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">💵 Efectivo</p>
                  <p className="text-lg font-bold text-gray-800">{formatCOP(sesion.totalEfectivoCop)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">🏦 Transferencia</p>
                  <p className="text-lg font-bold text-gray-800">{formatCOP(sesion.totalTransferenciaCop)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">📋 Crédito</p>
                  <p className="text-lg font-bold text-gray-800">{formatCOP(sesion.totalCreditoCop)}</p>
                </div>
              </div>

              {/* Cierre */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Efectivo contado</span>
                  <span className="font-medium">{formatCOP(sesion.saldoFinalCop)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo esperado</span>
                  <span className="font-medium">{formatCOP(sesion.saldoEsperadoCop)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-700">Diferencia</span>
                  <span className={`font-bold ${sesion.diferenciaCop >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sesion.diferenciaCop >= 0 ? '+' : ''}{formatCOP(sesion.diferenciaCop)}
                  </span>
                </div>
                {sesion.notasCierre && (
                  <div className="pt-2 border-t">
                    <p className="text-gray-400 text-xs mb-1">Notas de cierre</p>
                    <p className="text-gray-700">{sesion.notasCierre}</p>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-400 pt-1">
                  <span>Apertura: {formatFecha(sesion.abiertaEn)}</span>
                  <span>Cierre: {formatFecha(sesion.cerradaEn)}</span>
                </div>
              </div>

              {/* Movimientos */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <DollarSign size={14} />
                  Movimientos ({sesion.movimientos?.length || 0})
                </p>
                {sesion.movimientos?.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin movimientos</p>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {sesion.movimientos?.map((m) => (
                      <FilaMovimiento key={m.id} mov={m} />
                    ))}
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