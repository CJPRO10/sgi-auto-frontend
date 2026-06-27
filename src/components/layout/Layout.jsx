import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Dashboard from '../../pages/dashboard/Dashboard'
import Placeholder from '../ui/Placeholder'
import Clientes from '../../pages/clientes/Clientes'
import Inventario from '../../pages/inventario/Inventario'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<Placeholder titulo="Punto de Venta" />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/clientes" element={<Placeholder titulo="Clientes" />} />
          <Route path="/taller" element={<Placeholder titulo="Taller" />} />
          <Route path="/caja" element={<Placeholder titulo="Caja" />} />
          <Route path="/reportes" element={<Placeholder titulo="Reportes" />} />
        </Routes>
      </main>
    </div>
  )
}