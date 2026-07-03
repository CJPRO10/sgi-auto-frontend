import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCajaActual, abrirCaja, cerrarCaja, registrarGasto } from '../../api/caja'
import { formatCOP, formatFecha } from '../../utils/formato'
import { DollarSign, Plus, Lock, Unlock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

function FilaMovimiento({ mov }) {
  const esIngreso = ['VENTA', 'APERTURA', 'ABONO_CREDITO'].includes(mov.tipo)
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${esIngreso ? 'bg-green-100' : 'bg-red-100'}`}>
          {esIngreso
            ? <TrendingUp size={13} className="text-green-600" />
            : <TrendingDown size={13} className="text-red-600" />}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{mov.descripcion}</p>
          <p className="text-xs text-gray-400">{formatFecha(mov.creadoEn)}</p>
        </div>
      </div>
      <span className={`text-sm font-semibold ${esIngreso ? 'text-green-600' : 'text-red-600'}`}>
        {esIngreso ? '+' : '-'}{formatCOP(mov.montoCop)}
      </span>
    </div>
  )
}

export default function Caja() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('sesion')

  // Formularios
  const [saldoApertura, setSaldoApertura] = useState('')
  const [saldoCierre, setSaldoCierre] = useState('')
  const [notasCierre, setNotasCierre] = useState('')
  const [montoGasto, setMontoGasto] = useState('')
  const [descGasto, setDescGasto] = useState('')
  const [error, setError] = useState('')

  const { data: cajaData, isLoading, isError } = useQuery({
    queryKey: ['caja-actual'],
    queryFn: () => getCajaActual().then((r) => r.data.datos),
    retry: false,
  })
  const sesion = cajaData
  const cajaAbierta = sesion?.estaAbierta === true

  const { mutate: abrir, isPending: abriendo } = useMutation({
    mutationFn: abrirCaja,
    onSuccess: () => {
      queryClient.invalidateQueries(['caja-actual'])
      queryClient.invalidateQueries(['dashboard'])
      setSaldoApertura('')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al abrir caja'),
  })

  const { mutate: cerrar, isPending: cerrando } = useMutation({
    mutationFn: cerrarCaja,
    onSuccess: () => {
      queryClient.invalidateQueries(['caja-actual'])
      queryClient.invalidateQueries(['dashboard'])
      setSaldoCierre('')
      setNotasCierre('')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al cerrar caja'),
  })

  const { mutate: gasto, isPending: guardandoGasto } = useMutation({
    mutationFn: registrarGasto,
    onSuccess: () => {
      queryClient.invalidateQueries(['caja-actual'])
      setMontoGasto('')
      setDescGasto('')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al registrar gasto'),
  })

  const handleAbrir = (e) => {
    e.preventDefault()
    setError('')
    if (!saldoApertura) { setError('Ingresa el saldo inicial'); return }
    abrir({ saldoInicialCop: Number(saldoApertura) })
  }

  const handleCerrar = (e) => {
    e.preventDefault()
    setError('')
    if (!saldoCierre) { setError('Ingresa el efectivo contado'); return }
    cerrar({ saldoFinalContadoCop: Number(saldoCierre), notas: notasCierre })
  }

  const handleGasto = (e) => {
    e.preventDefault()
    setError('')
    if (!montoGasto || !descGasto) { setError('Monto y descripción son obligatorios'); return }
    gasto({ montoCop: Number(montoGasto), descripcion: descGasto })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Caja</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de sesiones de caja</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cajaAbierta ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {cajaAbierta ? <Unlock size={14} /> : <Lock size={14} />}
          {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
        </div>
      </div>

      {/* Caja cerrada — formulario apertura */}
      {!cajaAbierta && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Unlock size={16} className="text-green-600" />
            Abrir sesión de caja
          </h2>
          <form onSubmit={handleAbrir} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saldo inicial (COP)
              </label>
              <input
                type="number"
                placeholder="Ej: 200000"
                value={saldoApertura}
                onChange={(e) => setSaldoApertura(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={abriendo}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {abriendo ? 'Abriendo...' : 'Abrir caja'}
            </button>
          </form>
        </div>
      )}

      {/* Caja abierta */}
      {cajaAbierta && sesion && (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Saldo inicial', valor: sesion.saldoInicialCop, color: 'text-gray-800' },
              { label: 'Ventas del turno', valor: sesion.totalVentasCop, color: 'text-green-600' },
              { label: 'Gastos', valor: sesion.totalGastosCop, color: 'text-red-600' },
              { label: 'Saldo esperado', valor: sesion.saldoEsperadoCop, color: 'text-blue-600' },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{formatCOP(m.valor)}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { key: 'sesion', label: 'Movimientos' },
              { key: 'gasto', label: 'Registrar gasto' },
              { key: 'cierre', label: 'Cerrar caja' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError('') }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab movimientos */}
          {tab === 'sesion' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-700">
                  Movimientos — Cajera: {sesion.cajera}
                </h3>
                <span className="text-xs text-gray-400 ml-auto">
                  Desde {formatFecha(sesion.abiertaEn)}
                </span>
              </div>
              {sesion.movimientos?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">Sin movimientos aún</p>
              ) : (
                <div className="space-y-1">
                  {sesion.movimientos?.map((m) => (
                    <FilaMovimiento key={m.id} mov={m} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab gasto */}
          {tab === 'gasto' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
              <h3 className="font-semibold text-gray-700 mb-4">Registrar gasto operativo</h3>
              <form onSubmit={handleGasto} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Papelería, servicios..."
                    value={descGasto}
                    onChange={(e) => setDescGasto(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto (COP)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 15000"
                    value={montoGasto}
                    onChange={(e) => setMontoGasto(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={guardandoGasto}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {guardandoGasto ? 'Registrando...' : 'Registrar gasto'}
                </button>
              </form>
            </div>
          )}

          {/* Tab cierre */}
          {tab === 'cierre' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
              <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" />
                Cerrar sesión de caja
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Saldo esperado: <strong>{formatCOP(sesion.saldoEsperadoCop)}</strong>
              </p>
              <form onSubmit={handleCerrar} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Efectivo contado (COP)
                  </label>
                  <input
                    type="number"
                    placeholder="Ingresa el dinero contado en caja"
                    value={saldoCierre}
                    onChange={(e) => setSaldoCierre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas de cierre (opcional)
                  </label>
                  <textarea
                    placeholder="Observaciones del turno..."
                    value={notasCierre}
                    onChange={(e) => setNotasCierre(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={cerrando}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {cerrando ? 'Cerrando...' : 'Cerrar caja'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  )
}