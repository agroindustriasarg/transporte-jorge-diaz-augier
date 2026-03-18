import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Viaje } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export default function FacturasAPagar() {
  const { token } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);

  useEffect(() => {
    fetch(`${API}/viajes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: Viaje[]) => setViajes(data.filter(v => v.fcNro && v.estadoPago === 'PENDIENTE')));
  }, [token]);

  const fmt = (n?: number) => n !== undefined ? `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-';
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('es-AR') : '-';

  const getVencimiento = (v: Viaje) => {
    if (!v.fechaRecepcion || !v.fletero?.plazo) return '-';
    const f = new Date(v.fechaRecepcion);
    f.setDate(f.getDate() + v.fletero.plazo);
    return f.toLocaleDateString('es-AR');
  };

  const isVencido = (v: Viaje) => {
    if (!v.fechaRecepcion || !v.fletero?.plazo) return false;
    const f = new Date(v.fechaRecepcion);
    f.setDate(f.getDate() + v.fletero.plazo);
    return f < new Date();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Facturas a Pagar</h1>
        <span className="text-sm text-gray-500">{viajes.length} factura(s) pendiente(s)</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-2 text-left">Fecha Viaje</th><th className="px-4 py-2 text-left">Cliente</th><th className="px-4 py-2 text-left">Origen → Destino</th><th className="px-4 py-2 text-left">Fletero</th><th className="px-4 py-2 text-left">N° Factura</th><th className="px-4 py-2 text-left">Recepción</th><th className="px-4 py-2 text-left">Vencimiento</th><th className="px-4 py-2 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {viajes.map(v => (
              <tr key={v.id} className={`hover:bg-gray-50 ${isVencido(v) ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-2">{fmtDate(v.fecha)}</td>
                <td className="px-4 py-2">{v.cliente?.nombre || '-'}</td>
                <td className="px-4 py-2">{v.origen} → {v.destino}</td>
                <td className="px-4 py-2">{v.fletero?.nombre || '-'}</td>
                <td className="px-4 py-2 font-medium">{v.fcNro}</td>
                <td className="px-4 py-2">{fmtDate(v.fechaRecepcion)}</td>
                <td className={`px-4 py-2 ${isVencido(v) ? 'text-red-600 font-medium' : ''}`}>{getVencimiento(v)}</td>
                <td className="px-4 py-2 text-right">{fmt(v.totalViaje)}</td>
              </tr>
            ))}
            {viajes.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin facturas pendientes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
