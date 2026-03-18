import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/viajes', label: 'Viajes', icon: '🚛' },
  { path: '/ordenes-pago', label: 'Órdenes de Pago', icon: '💳' },
  { path: '/facturas-a-pagar', label: 'Facturas a Pagar', icon: '📄' },
];

const configItems = [
  { path: '/clientes', label: 'Clientes', icon: '🏢' },
  { path: '/fleteros', label: 'Fleteros', icon: '🚚' },
  { path: '/comisionistas', label: 'Comisionistas', icon: '👤' },
  { path: '/rutas', label: 'Rutas / Tarifas', icon: '🗺️' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [configOpen, setConfigOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-white font-bold text-base leading-tight">JL Distribuciones</h1>
          <p className="text-gray-400 text-xs mt-1">{user?.nombre} {user?.apellido}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              <span>{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-2">
            <button onClick={() => setConfigOpen(!configOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
              <span className="flex items-center gap-2"><span>⚙️</span><span>Configuración</span></span>
              <span className="text-xs">{configOpen ? '▲' : '▼'}</span>
            </button>
            {configOpen && (
              <div className="ml-3 mt-1 space-y-1">
                {configItems.map((item) => (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-left">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
