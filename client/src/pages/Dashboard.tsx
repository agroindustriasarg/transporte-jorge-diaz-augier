import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Viaje } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export default function Dashboard() {
  const { token } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [stats, setStats] = useState({ total: 0, pendientes: 0, completados: 0, aPagar: 0 });

  useEffect(() => {
    fetch(`${API}/viajes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: Viaje[]) => {
        setViajes(data.slice(0, 10));
        setStats({
          total: data.length,
          pendientes: data.filter(v => v.estadoViaje === 'PENDIENTE').length,
          completados: data.filter(v => v.estadoViaje === 'COMPLETADO').length,
          aPagar: data.filter(v => v.fcNro && v.estadoPago === 'PENDIENTE').length,
        });
      }).catch(() => {});
  }, [token]);

  const fmt = (n?: number) => n !== undefined ? `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-AR');
  const estadoColor: Record<string, string> = { PENDIENTE: 'bg-yellow-100 text-yellow-800', EN_CURSO: 'bg-blue-100 text-blue-800', COMPLETADO: 'bg-green-100 text-green-800', CANCELADO: 'bg-red-100 text-red-800' };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{ label: 'Total Viajes', value: stats.total, color: 'bg-blue-50 text-blue-700' }, { label: 'Pendientes', value: stats.pendientes, color: 'bg-yellow-50 text-yellow-700' }, { label: 'Completados', value: stats.completados, color: 'bg-green-50 text-green-700' }, { label: 'Fact. a Pagar', value: stats.aPagar, color: 'bg-red-50 text-red-700' }].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b"><h2 className="font-semibold text-gray-700">Últimos 10 Viajes</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Origen → Destino</th>
                <th className="px-4 py-2 text-left">Fletero</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {viajes.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{fmtDate(v.fecha)}</td>
                  <td className="px-4 py-2">{v.cliente?.nombre || '-'}</td>
                  <td className="px-4 py-2">{v.origen} → {v.destino}</td>
                  <td className="px-4 py-2">{v.fletero?.nombre || '-'}</td>
                  <td className="px-4 py-2 text-right">{fmt(v.totalViaje)}</td>
                  <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[v.estadoViaje]}`}>{v.estadoViaje}</span></td>
                </tr>
              ))}
              {viajes.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin viajes registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
