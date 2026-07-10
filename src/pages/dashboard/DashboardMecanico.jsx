import { useQuery } from '@tanstack/react-query'
import { getDashboardMecanico } from '../../api/dashboard'
import { formatCOP } from '../../utils/formato'
import { Wrench, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

function Tarjeta({ titulo, valor, subtitulo, icono: Icon, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{titulo}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
      {subtitulo && <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>}
    </div>
  )
}

export default function DashboardMecanico() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-mecanico'],
    queryFn: () => getDashboardMecanico().then((r) => r.data.datos),
    refetchInterval: 30000,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (isError) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">Error al cargar el dashboard</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido, {data.nombreMecanico}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Estado actual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tarjeta
            titulo="OTs activas"
            valor={data.otsActivasHoy}
            subtitulo="asignadas a ti"
            icono={Clock}
            color="bg-blue-500"
          />
          <Tarjeta
            titulo="En reparación"
            valor={data.otsEnReparacion}
            subtitulo="en proceso"
            icono={Wrench}
            color="bg-yellow-500"
          />
          <Tarjeta
            titulo="Listas"
            valor={data.otsListas}
            subtitulo="esperando entrega"
            icono={CheckCircle}
            color="bg-green-500"
          />
          <Tarjeta
            titulo="Entregadas hoy"
            valor={data.otsEntregadasHoy}
            subtitulo="completadas"
            icono={TrendingUp}
            color="bg-purple-500"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Resumen del mes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">OTs completadas este mes</p>
            <p className="text-3xl font-bold text-gray-800">{data.otsTotalesDelMes}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total facturado este mes</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCOP(data.totalFacturadoMesCop)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}