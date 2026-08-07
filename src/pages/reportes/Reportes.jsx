import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getReporteVentas,
  getReporteInventario,
  getListaPrecios,
} from '../../api/reportes'
import { formatCOP, formatFecha } from '../../utils/formato'
import { jsPDF } from 'jspdf'
import { BarChart3, Package, DollarSign, Download, Search } from 'lucide-react'

function pdfVentas(ventas, desde, hasta) {
  const doc = new jsPDF()
  const fmt = (n) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(n || 0)

  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('SGI-AUTO — Reporte de Ventas', 14, 20)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Periodo: ${desde} al ${hasta}`, 14, 28)
  doc.text(`Total ventas: ${ventas.length}`, 14, 35)
  const total = ventas.reduce((s, v) => s + (v.totalCop || 0), 0)
  doc.text(`Total ingresos: ${fmt(total)}`, 14, 42)
  doc.line(14, 46, 196, 46)

  let y = 54
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(14, y - 5, 182, 7, 'F')
  doc.text('Cliente', 16, y)
  doc.text('Metodo', 80, y)
  doc.text('Items', 120, y)
  doc.text('Total', 145, y)
  doc.text('Fecha', 170, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  ventas.forEach((v) => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.text((v.nombreCliente || 'Ocasional').substring(0, 25), 16, y)
    doc.text(v.metodoPago || '', 80, y)
    doc.text(String(v.cantidadItems || 0), 120, y)
    doc.text(fmt(v.totalCop), 140, y)
    doc.text(v.fecha ? new Date(v.fecha).toLocaleDateString('es-CO') : '', 170, y)
    y += 7
  })

  doc.setFontSize(8); doc.setTextColor(150, 150, 150)
  doc.text('Generado por SGI-AUTO — ' + new Date().toLocaleDateString('es-CO'), 14, 290)
  doc.setTextColor(0, 0, 0)
  doc.save(`ventas-${desde}-${hasta}.pdf`)
}

function pdfInventario(productos) {
  const doc = new jsPDF()
  const fmt = (n) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(n || 0)

  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('SGI-AUTO — Reporte de Inventario', 14, 20)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 28)
  doc.line(14, 32, 196, 32)

  let y = 42
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(14, y - 5, 182, 7, 'F')
  doc.text('Producto', 16, y)
  doc.text('Stock', 100, y)
  doc.text('Min', 120, y)
  doc.text('Precio', 145, y)
  doc.text('Estado', 175, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  productos.forEach((p) => {
    if (y > 270) { doc.addPage(); y = 20 }
    p.stockBajo ? doc.setTextColor(220, 38, 38) : doc.setTextColor(0, 0, 0)
    doc.text((p.nombre || '').substring(0, 35), 16, y)
    doc.setTextColor(0, 0, 0)
    doc.text(String(p.stockActual), 100, y)
    doc.text(String(p.stockMinimo), 120, y)
    doc.text(fmt(p.precioVentaDetal), 140, y)
    doc.text(p.stockActual === 0 ? 'Agotado' : p.stockBajo ? 'Bajo' : 'OK', 175, y)
    y += 7
  })

  doc.setFontSize(8); doc.setTextColor(150, 150, 150)
  doc.text('Generado por SGI-AUTO — ' + new Date().toLocaleDateString('es-CO'), 14, 290)
  doc.setTextColor(0, 0, 0)
  doc.save('inventario.pdf')
}

function pdfListaPrecios(productos) {
  const doc = new jsPDF()
  const fmt = (n) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(n || 0)

  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('SGI-AUTO — Lista de Precios', 14, 20)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 28)
  doc.line(14, 32, 196, 32)

  let y = 42
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(14, y - 5, 182, 7, 'F')
  doc.text('Producto', 16, y)
  doc.text('Codigo', 110, y)
  doc.text('Precio', 155, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  productos.forEach((p) => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.text((p.nombre || '').substring(0, 45), 16, y)
    doc.text(p.codigo || '', 110, y)
    doc.text(fmt(p.precioVentaDetal), 155, y)
    y += 7
  })

  doc.setFontSize(8); doc.setTextColor(150, 150, 150)
  doc.text('Generado por SGI-AUTO — ' + new Date().toLocaleDateString('es-CO'), 14, 290)
  doc.setTextColor(0, 0, 0)
  doc.save('lista-precios.pdf')
}

export default function Reportes() {
  const [tab, setTab] = useState('ventas')
  const [desde, setDesde] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  )
  const [hasta, setHasta] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [buscar, setBuscar] = useState(0)

  const { data: ventasData, isLoading: cargandoVentas } = useQuery({
    queryKey: ['reporte-ventas', desde, hasta, buscar],
    queryFn: () => getReporteVentas(desde, hasta).then((r) => r.data.datos),
    enabled: Boolean(buscar > 0),
  })

  const { data: inventarioData } = useQuery({
    queryKey: ['reporte-inventario'],
    queryFn: () => getReporteInventario().then((r) => r.data.datos),
    enabled: Boolean(tab === 'inventario'),
  })

  const { data: listaPreciosData } = useQuery({
    queryKey: ['lista-precios'],
    queryFn: () => getListaPrecios().then((r) => r.data.datos),
    enabled: Boolean(tab === 'precios'),
  })

  const ventas = ventasData?.content || ventasData || []
  const inventario = inventarioData || []
  const listaPrecios = listaPreciosData || []
  const fmt = (n) => formatCOP(n || 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-500 text-sm mt-1">Análisis y exportación de datos</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'ventas', label: 'Ventas', icon: DollarSign },
          { key: 'inventario', label: 'Inventario', icon: Package },
          { key: 'precios', label: 'Lista de precios', icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab ventas */}
      {tab === 'ventas' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => { setDesde(e.target.value); setBuscar(0) }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => { setHasta(e.target.value); setBuscar(0) }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setBuscar((n) => n + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Search size={14} /> Generar
            </button>
            {ventas.length > 0 && (
              <button
                onClick={() => pdfVentas(ventas, desde, hasta)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
              >
                <Download size={14} /> PDF
              </button>
            )}
          </div>

          {cargandoVentas && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {ventas.length > 0 && !cargandoVentas && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Total ventas</p>
                  <p className="text-2xl font-bold text-gray-800">{ventas.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Ingresos</p>
                  <p className="text-xl font-bold text-green-700">
                    {fmt(ventas.reduce((s, v) => s + (v.totalCop || 0), 0))}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Ticket promedio</p>
                  <p className="text-xl font-bold text-blue-700">
                    {fmt(ventas.reduce((s, v) => s + (v.totalCop || 0), 0) / ventas.length)}
                  </p>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Método</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">Items</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2">Total</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ventas.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{v.nombreCliente || 'Ocasional'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{v.metodoPago}</td>
                      <td className="px-4 py-3 text-center text-sm">{v.cantidadItems}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{fmt(v.totalCop)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatFecha(v.fecha)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {buscar > 0 && !cargandoVentas && ventas.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Sin ventas en ese período</p>
          )}
        </div>
      )}

      {/* Tab inventario */}
      {tab === 'inventario' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Reporte de inventario</h2>
            {inventario.length > 0 && (
              <button
                onClick={() => pdfInventario(inventario)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
              >
                <Download size={14} /> PDF
              </button>
            )}
          </div>
          {!inventarioData ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : inventario.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin productos</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Producto</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Categoría</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">Stock</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">Mínimo</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2">Precio</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventario.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.categoria || '—'}</td>
                    <td className={`px-4 py-3 text-center text-sm font-bold ${p.stockActual === 0 ? 'text-red-600' : p.stockBajo ? 'text-yellow-600' : 'text-gray-800'}`}>
                      {p.stockActual}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{p.stockMinimo}</td>
                    <td className="px-4 py-3 text-right text-sm">{fmt(p.precioVentaDetal)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.stockActual === 0
                        ? <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Agotado</span>
                        : p.stockBajo
                          ? <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Stock bajo</span>
                          : <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab lista de precios */}
      {tab === 'precios' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Lista de precios</h2>
            {listaPrecios.length > 0 && (
              <button
                onClick={() => pdfListaPrecios(listaPrecios)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
              >
                <Download size={14} /> PDF
              </button>
            )}
          </div>
          {!listaPreciosData ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : listaPrecios.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No hay productos en la lista de precios</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Producto</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Categoría</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listaPrecios.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{p.codigo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.categoriaNombre || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">{fmt(p.precioVentaDetal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}