// @ts-nocheck
import { Link } from 'react-router-dom';
import { CreditCard, Wheat, TrendingUp } from 'lucide-react';

const submodules = [
  {
    name: 'Pagos',
    icon: CreditCard,
    description: 'Gestión de pagos',
    path: '/pagos',
    color: 'bg-teal-500',
  },
  {
    name: 'Precios Cereales',
    icon: Wheat,
    description: 'Precios de cereales',
    path: '/precios-cereales',
    color: 'bg-yellow-500',
  },
  {
    name: 'Ganancias',
    icon: TrendingUp,
    description: 'Resumen de ganancias',
    path: '/ganancias',
    color: 'bg-emerald-500',
  },
];

export default function Contabilidad() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contabilidad</h1>
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
