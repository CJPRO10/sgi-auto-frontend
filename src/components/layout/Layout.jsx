import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Dashboard from '../../pages/dashboard/Dashboard'
import DashboardMecanico from '../../pages/dashboard/DashboardMecanico'
import Placeholder from '../ui/Placeholder'
import Clientes from '../../pages/clientes/Clientes'
import Inventario from '../../pages/inventario/Inventario'
import Taller from '../../pages/taller/Taller'
import Pos from '../../pages/pos/Pos'
import Caja from '../../pages/caja/Caja'
import Reportes from '../../pages/reportes/Reportes'
import Usuarios from '../../pages/usuarios/Usuarios'
import useAuthStore from '../../store/authStore'
import Compras from '../../pages/compras/Compras'
import Categorias from '../../pages/inventario/Categorias'
import DashboardCajera from '../../pages/dashboard/DashboardCajera'

export default function Layout() {
  const usuario = useAuthStore((s) => s.usuario)
  const esMecanico = usuario?.rol === 'MECANICO'
  const esCajera = usuario?.rol === 'CAJERA'

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={esMecanico ? <DashboardMecanico /> : esCajera ? <DashboardCajera /> : <Dashboard />} />
          <Route path="/dashboard" element={esMecanico ? <DashboardMecanico /> : esCajera ? <DashboardCajera /> : <Dashboard />} />
          <Route path="/pos" element={<Pos />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/taller" element={<Taller />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/categorias" element={<Categorias />} />
        </Routes>
      </main>
    </div>
  )
}