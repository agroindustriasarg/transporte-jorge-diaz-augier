import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OrdenPago } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export default function OrdenesPago() {
  const { token } = useAuth();
  const [ordenes, setOrdenes] = useState<OrdenPago[]>([]);

  useEffect(() => {
    fetch(`${API}/ordenes-pago`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setOrdenes);
  }, [token]);

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-AR');
  const estadoColor: Record<string, string> = { PENDIENTE: 'bg-yellow-100 text-yellow-800', PAGADO: 'bg-green-100 text-green-800' };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Órdenes de Pago</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-2 text-left">N°</th><th className="px-4 py-2 text-left">Fecha</th><th className="px-4 py-2 text-left">Fletero</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2 text-center">Estado</th><th className="px-4 py-2 text-left">Viajes</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordenes.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">#{o.numero}</td>
                <td className="px-4 py-2">{fmtDate(o.fecha)}</td>
                <td className="px-4 py-2">{o.fletero?.nombre || '-'}</td>
                <td className="px-4 py-2 text-right">{fmt(o.total)}</td>
                <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[o.estado] || 'bg-gray-100 text-gray-800'}`}>{o.estado}</span></td>
                <td className="px-4 py-2">{o.viajes?.length || 0} viaje(s)</td>
              </tr>
            ))}
            {ordenes.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin órdenes de pago</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
