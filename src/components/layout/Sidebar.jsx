import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useCajaStore from '../../store/cajaStore'
import { getCajaActual } from '../../api/caja'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wrench,
  DollarSign,
  BarChart3,
  LogOut,
  Truck,
  Tag,
  DatabaseZap,
} from 'lucide-react'

const NAV_DUENO = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  { to: '/inventario', icon: Package, label: 'Inventario' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/taller', icon: Wrench, label: 'Taller' },
  { to: '/caja', icon: DollarSign, label: 'Caja' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/compras', icon: Truck, label: 'Compras' },
  { to: '/categorias', icon: Tag, label: 'Categorías' },
  { to: '/backup', icon: DatabaseZap, label: 'Copias de seguridad' },
]

const NAV_CAJERA = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/caja', icon: DollarSign, label: 'Caja' },
  { to: '/compras', icon: Truck, label: 'Compras' },
  { to: '/categorias', icon: Tag, label: 'Categorías' },
]

const NAV_MECANICO = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/taller', icon: Wrench, label: 'Taller' },
]

export default function Sidebar() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()
  const cajaAbierta = useCajaStore((state) => state.cajaAbierta)

  const esMecanico = usuario?.rol === 'MECANICO'
  const esCajera = usuario?.rol === 'CAJERA'
  const navItems = esMecanico ? NAV_MECANICO : esCajera ? NAV_CAJERA : NAV_DUENO

  const handleLogout = async () => {
  if (cajaAbierta) {
    const confirmar = window.confirm(
      '⚠️ La caja está abierta.\n\n¿Deseas cerrar sesión y dejar la caja abierta?\n\nPresiona "Cancelar" para ir a cerrar la caja primero.'
    )
    if (!confirmar) {
      navigate('/caja')
      return
    }
  }
  logout()
  navigate('/login')
}

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img src="/logo-db.png" alt="Logo" className="w-10 h-10 object-contain flex-shrink-0" />
          <div>
            <h1 className="font-bold text-sm leading-tight">Almacén y Servicios</h1>
            <h1 className="font-bold text-sm leading-tight">Eléctricos DB</h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium truncate">
            {usuario?.nombreCompleto || 'Usuario'}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {usuario?.rol === 'DUENO' ? 'Dueño' :
             usuario?.rol === 'CAJERA' ? 'Cajera' :
             usuario?.rol === 'MECANICO' ? 'Mecánico' : ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}