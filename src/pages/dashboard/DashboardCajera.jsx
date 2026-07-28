import { useQuery } from '@tanstack/react-query'
import { getCajaActual } from '../../api/caja'
import { getVentasHoy } from '../../api/pos'
import { formatCOP } from '../../utils/formato'
import { ShoppingCart, DollarSign, Users, TrendingUp } from 'lucide-react'
import useCajaStore from '../../store/cajaStore'

export default function DashboardCajera() {
  const cajaAbierta = useCajaStore((s) => s.cajaAbierta)

  const { data: cajaData } = useQuery({
    queryKey: ['caja-actual'],
    queryFn: () => getCajaActual().then((r) => r.data.datos),
    retry: false,
    enabled: cajaAbierta,
  })

  const { data: ventasData } = useQuery({
    queryKey: ['ventas-hoy'],
    queryFn: () => getVentasHoy().then((r) => r.data.datos),
    retry: false,
  })

  const ventas = ventasData?.content || []
  const totalVentas = ventas.reduce((s, v) => s + (v.totalCop || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Ventas hoy</p>
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{ventas.length}</p>
          <p className="text-xs text-gray-400 mt-1">transacciones</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Ingresos hoy</p>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp size={16} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCOP(totalVentas)}</p>
          <p className="text-xs text-gray-400 mt-1">ventas completadas</p>
        </div>

        {cajaAbierta && cajaData && (
          <>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">Efectivo en caja</p>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <DollarSign size={16} className="text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatCOP(cajaData.totalEfectivoCop)}</p>
              <p className="text-xs text-gray-400 mt-1">del turno actual</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">Saldo esperado</p>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <DollarSign size={16} className="text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCOP(cajaData.saldoEsperadoCop)}</p>
              <p className="text-xs text-gray-400 mt-1">en caja</p>
            </div>
          </>
        )}
      </div>

      {!cajaAbierta && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          ⚠️ No hay caja abierta. Ve a <strong>Caja</strong> para iniciar el turno.
        </div>
      )}

      {cajaAbierta && cajaData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Resumen del turno</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Gastos</p>
              <p className="font-semibold text-red-600">{formatCOP(cajaData.totalGastosCop)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Transferencias</p>
              <p className="font-semibold text-gray-800">{formatCOP(cajaData.totalTransferenciaCop)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Crédito</p>
              <p className="font-semibold text-gray-800">{formatCOP(cajaData.totalCreditoCop)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}