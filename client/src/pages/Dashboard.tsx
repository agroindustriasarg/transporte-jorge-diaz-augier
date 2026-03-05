import { Link } from 'react-router-dom';
import { Building2, Users, MapPin, User, UserCog, FileText, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const modules = [
  {
    name: 'Proveedores',
    icon: Building2,
    description: 'Gestión de proveedores',
    path: '/proveedores',
    color: 'bg-blue-500',
  },
  {
    name: 'Clientes',
    icon: Users,
    description: 'Gestión de clientes',
    path: '/clientes',
    color: 'bg-green-500',
  },
  {
    name: 'Viajes',
    icon: MapPin,
    description: 'Registro de viajes',
    path: '/viajes',
    color: 'bg-orange-500',
  },
  {
    name: 'Choferes',
    icon: User,
    description: 'Gestión de choferes',
    path: '/choferes',
    color: 'bg-purple-500',
  },
  {
    name: 'Usuarios',
    icon: UserCog,
    description: 'Administración de usuarios',
    path: '/usuarios',
    color: 'bg-slate-500',
  },
  {
    name: 'Reportes',
    icon: FileText,
    description: 'Análisis y reportes',
    path: '/reportes',
    color: 'bg-indigo-500',
  },
  {
    name: 'Contabilidad',
    icon: Calculator,
    description: 'Análisis contable y financiero',
    path: '/contabilidad',
    color: 'bg-pink-500',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombre} {user?.apellido}
        </h1>
        <p className="text-gray-600 mt-2">Selecciona un módulo para comenzar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.name} to={module.path} className="card group cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`${module.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{module.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
