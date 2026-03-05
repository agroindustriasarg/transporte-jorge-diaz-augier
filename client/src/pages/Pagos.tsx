// @ts-nocheck
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, Truck, ArrowLeft } from 'lucide-react';

const submodules = [
  {
    name: 'Pago Proveedores',
    icon: Building2,
    description: 'Pagos a proveedores',
    path: '/pagos/proveedores',
    color: 'bg-blue-500',
  },
  {
    name: 'Cobranza Clientes',
    icon: Users,
    description: 'Cobranza de clientes',
    path: '/pagos/clientes',
    color: 'bg-green-500',
  },
  {
    name: 'Pago Transportes',
    icon: Truck,
    description: 'Pagos a transportes',
    path: '/pagos/transportes',
    color: 'bg-orange-500',
  },
];

export default function Pagos() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="mb-8">
        <button onClick={() => navigate('/contabilidad')} className="btn-secondary flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Contabilidad
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600 mt-2">Selecciona un módulo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submodules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.name} to={mod.path} className="card group cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`${mod.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{mod.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
