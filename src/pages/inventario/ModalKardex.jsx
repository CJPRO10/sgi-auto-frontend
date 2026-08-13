import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatCOP, formatFecha } from '../../utils/formato'
import { X, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import api from '../../api/axios'

const getKardex = (id, pagina = 0) =>
  api.get(`/inventario/productos/${id}/kardex?page=${pagina}&size=20`)
    .then((r) => r.data.datos)

const TIPO_CONFIG = {
  ENTRADA: { label: 'Entrada', color: 'text-green-600', bg: 'bg-green-100', icono: TrendingUp },
  VENTA: { label: 'Venta', color: 'text-red-600', bg: 'bg-red-100', icono: TrendingDown },
  AJUSTE: { label: 'Ajuste', color: 'text-blue-600', bg: 'bg-blue-100', icono: TrendingUp },
  USO_TALLER: { label: 'Uso taller', color: 'text-orange-600', bg: 'bg-orange-100', icono: TrendingDown },
  DEVOLUCION_ENTRADA: { label: 'Dev. entrada', color: 'text-purple-600', bg: 'bg-purple-100', icono: TrendingDown },
  DEVOLUCION_SALIDA: { label: 'Dev. salida', color: 'text-teal-600', bg: 'bg-teal-100', icono: TrendingUp },
}

function generarPDFKardex(producto, movimientos) {
  const doc = new jsPDF()
  const fmt = (n) => n != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
    : '—'

  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('SGI-AUTO — Kardex de Producto', 14, 20)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Producto: ${producto.nombre}`, 14, 28)
  doc.text(`Código: ${producto.codigo}`, 14, 34)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 40)
  doc.line(14, 44, 196, 44)

  let y = 52
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(14, y - 5, 182, 7, 'F')
  doc.text('Tipo', 16, y)
  doc.text('Cantidad', 55, y)
  doc.text('Antes', 85, y)
  doc.text('Después', 110, y)
  doc.text('Costo unit.', 138, y)
  doc.text('Fecha', 168, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  movimientos.forEach((m) => {
    if (y > 270) { doc.addPage(); y = 20 }
    const config = TIPO_CONFIG[m.tipoMovimiento]
    doc.text(config?.label || m.tipoMovimiento, 16, y)
    doc.text(String(m.cantidad), 55, y)
    doc.text(String(m.stockAntes), 85, y)
    doc.text(String(m.stockDespues), 110, y)
    doc.text(fmt(m.costoUnitarioCop), 138, y)
    doc.text(m.creadoEn ? new Date(m.creadoEn).toLocaleDateString('es-CO') : '—', 168, y)
    y += 7
  })

  doc.setFontSize(8); doc.setTextColor(150, 150, 150)
  doc.text('Generado por SGI-AUTO — ' + new Date().toLocaleDateString('es-CO'), 14, 290)
  doc.setTextColor(0, 0, 0)
  doc.save(`kardex-${producto.codigo}.pdf`)
}

export default function ModalKardex({ producto, onClose }) {
  const [pagina, setPagina] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['kardex', producto.id, pagina],
    queryFn: () => getKardex(producto.id, pagina),
    keepPreviousData: true,
  })

  const movimientos = data?.content || []
  const totalPaginas = data?.totalPages || 1

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Kardex — {producto.nombre}</h2>
            <p className="text-sm text-gray-400">
              Código: {producto.codigo} · Stock actual: <strong>{producto.stockActual}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {movimientos.length > 0 && (
              <button
                onClick={() => generarPDFKardex(producto, movimientos)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                <Download size={14} /> PDF
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">Sin movimientos registrados</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Tipo</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Cantidad</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Stock antes</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Stock después</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Costo unit.</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Registrado por</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Notas</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movimientos.map((m) => {
                  const config = TIPO_CONFIG[m.tipoMovimiento] || {
                    label: m.tipoMovimiento, color: 'text-gray-600',
                    bg: 'bg-gray-100', icono: TrendingUp
                  }
                  const Icono = config.icono
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bg}`}>
                            <Icono size={12} className={config.color} />
                          </div>
                          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-sm font-semibold">{m.cantidad}</td>
                      <td className="px-6 py-3 text-center text-sm text-gray-500">{m.stockAntes}</td>
                      <td className="px-6 py-3 text-center text-sm font-medium">{m.stockDespues}</td>
                      <td className="px-6 py-3 text-right text-sm">
                        {m.costoUnitarioCop
                          ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(m.costoUnitarioCop)
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{m.registradoPor || '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-32 truncate">{m.notas || '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{formatFecha(m.creadoEn)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {pagina + 1} de {totalPaginas}</span>
            <button onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina >= totalPaginas - 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}