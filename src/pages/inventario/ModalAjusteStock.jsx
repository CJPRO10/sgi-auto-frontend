import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ajustarStock } from '../../api/inventario'
import { X, SlidersHorizontal, Plus, Minus } from 'lucide-react'
import { formatCOP } from '../../utils/formato'

export default function ModalAjusteStock({ producto, onClose, onSuccess }) {
  const [tipo, setTipo] = useState('entrada')
  const [cantidad, setCantidad] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: (datos) => ajustarStock(producto.id, datos),
    onSuccess,
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al ajustar stock'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!cantidad || Number(cantidad) <= 0) {
      setError('Ingresa una cantidad válida')
      return
    }
    if (!notas.trim()) {
      setError('El motivo del ajuste es obligatorio')
      return
    }
    const cantidadFinal = tipo === 'salida' ? -Number(cantidad) : Number(cantidad)
    mutate({ cantidad: cantidadFinal, notas: notas.trim() })
  }

  const stockResultante = producto.stockActual + (
    cantidad && Number(cantidad) > 0
      ? tipo === 'salida' ? -Number(cantidad) : Number(cantidad)
      : 0
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-orange-500" />
            <div>
              <h2 className="font-semibold text-gray-800">Ajuste de stock</h2>
              <p className="text-sm text-gray-400">{producto.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Stock actual */}
          <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">Stock actual</span>
            <span className="font-bold text-gray-800 text-lg">{producto.stockActual}</span>
          </div>

          {/* Tipo de ajuste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ajuste</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTipo('entrada')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  tipo === 'entrada'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}>
                <Plus size={15} /> Entrada
              </button>
              <button type="button" onClick={() => setTipo('salida')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  tipo === 'salida'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}>
                <Minus size={15} /> Salida
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" min="1" placeholder="Ej: 10"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del ajuste</label>
            <textarea rows={2} placeholder="Ej: Mercancía dañada, conteo físico, error de registro..."
              value={notas} onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          {/* Preview resultado */}
          {cantidad && Number(cantidad) > 0 && (
            <div className={`rounded-lg p-3 text-sm flex justify-between items-center ${
              stockResultante < 0 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <span className="text-gray-600">Stock resultante</span>
              <span className={`font-bold text-lg ${stockResultante < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                {stockResultante}
              </span>
            </div>
          )}

          {stockResultante < 0 && cantidad && (
            <p className="text-red-500 text-xs">El stock no puede quedar negativo</p>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || stockResultante < 0}
              className={`flex-1 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${
                tipo === 'salida' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}>
              {isPending ? 'Aplicando...' : `Aplicar ${tipo}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}