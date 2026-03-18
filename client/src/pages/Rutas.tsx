import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ruta, Cliente } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export default function Rutas() {
  const { token } = useAuth();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Ruta | null>(null);
  const [form, setForm] = useState({ clienteId: '', origen: '', destino: '', tipoCarga: '', tarifaSinIVA: '', comision: '' });
  const [filterCliente, setFilterCliente] = useState('');

  const load = () => fetch(`${API}/rutas`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setRutas);
  useEffect(() => {
    load();
    fetch(`${API}/clientes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setClientes);
  }, []);

  const openNew = () => { setEditing(null); setForm({ clienteId: '', origen: '', destino: '', tipoCarga: '', tarifaSinIVA: '', comision: '' }); setModal(true); };
  const openEdit = (r: Ruta) => { setEditing(r); setForm({ clienteId: r.clienteId, origen: r.origen, destino: r.destino, tipoCarga: r.tipoCarga || '', tarifaSinIVA: String(r.tarifaSinIVA), comision: String(r.comision) }); setModal(true); };

  const save = async () => {
    const url = editing ? `${API}/rutas/${editing.id}` : `${API}/rutas`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setModal(false); load();
  };

  const del = async (id: string) => {
    if (!confirm('¿Eliminar ruta?')) return;
    await fetch(`${API}/rutas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  const filtered = rutas.filter(r => !filterCliente || r.clienteId === filterCliente);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Rutas / Tarifas</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Nueva Ruta</button>
      </div>
      <div className="mb-4">
        <select value={filterCliente} onChange={e => setFilterCliente(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todos los clientes</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-2 text-left">Cliente</th><th className="px-4 py-2 text-left">Origen</th><th className="px-4 py-2 text-left">Destino</th><th className="px-4 py-2 text-left">Tipo Carga</th><th className="px-4 py-2 text-right">Tarifa s/IVA</th><th className="px-4 py-2 text-right">Comisión</th><th className="px-4 py-2 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{r.cliente?.nombre || '-'}</td><td className="px-4 py-2">{r.origen}</td>
                <td className="px-4 py-2">{r.destino}</td><td className="px-4 py-2">{r.tipoCarga || '-'}</td>
                <td className="px-4 py-2 text-right">{fmt(r.tarifaSinIVA)}</td><td className="px-4 py-2 text-right">{fmt(r.comision)}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => del(r.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin rutas</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Nueva'} Ruta</h2>
            <div className="space-y-3">
              <div><label className="block text-sm text-gray-600 mb-1">Cliente</label>
                <select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Seleccionar...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select></div>
              {[{ k: 'origen', l: 'Origen' }, { k: 'destino', l: 'Destino' }, { k: 'tipoCarga', l: 'Tipo de Carga' }, { k: 'tarifaSinIVA', l: 'Tarifa s/IVA' }, { k: 'comision', l: 'Comisión' }].map(({ k, l }) => (
                <div key={k}><label className="block text-sm text-gray-600 mb-1">{l}</label>
                  <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} type={['tarifaSinIVA', 'comision'].includes(k) ? 'number' : 'text'} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              ))}
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
              <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
