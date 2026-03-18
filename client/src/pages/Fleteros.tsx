import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Fletero, Comisionista } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export default function Fleteros() {
  const { token } = useAuth();
  const [items, setItems] = useState<Fletero[]>([]);
  const [comisionistas, setComisionistas] = useState<Comisionista[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Fletero | null>(null);
  const [form, setForm] = useState({ nombre: '', cuit: '', telefono: '', email: '', formaPago: 'TRANSFERENCIA', plazo: '30', comisionistaId: '' });

  const load = () => fetch(`${API}/fleteros`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setItems);
  useEffect(() => {
    load();
    fetch(`${API}/comisionistas`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setComisionistas);
  }, []);

  const openNew = () => { setEditing(null); setForm({ nombre: '', cuit: '', telefono: '', email: '', formaPago: 'TRANSFERENCIA', plazo: '30', comisionistaId: '' }); setModal(true); };
  const openEdit = (f: Fletero) => { setEditing(f); setForm({ nombre: f.nombre, cuit: f.cuit || '', telefono: f.telefono || '', email: f.email || '', formaPago: f.formaPago, plazo: String(f.plazo), comisionistaId: f.comisionistaId || '' }); setModal(true); };

  const save = async () => {
    const url = editing ? `${API}/fleteros/${editing.id}` : `${API}/fleteros`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setModal(false); load();
  };

  const del = async (id: string) => {
    if (!confirm('¿Eliminar fletero?')) return;
    await fetch(`${API}/fleteros/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Fleteros</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Nuevo</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-2 text-left">Nombre</th><th className="px-4 py-2 text-left">CUIT</th><th className="px-4 py-2 text-left">Teléfono</th><th className="px-4 py-2 text-left">Forma Pago</th><th className="px-4 py-2 text-left">Plazo</th><th className="px-4 py-2 text-left">Comisionista</th><th className="px-4 py-2 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{f.nombre}</td><td className="px-4 py-2">{f.cuit || '-'}</td>
                <td className="px-4 py-2">{f.telefono || '-'}</td><td className="px-4 py-2">{f.formaPago}</td>
                <td className="px-4 py-2">{f.plazo} días</td><td className="px-4 py-2">{f.comisionista?.nombre || '-'}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button onClick={() => openEdit(f)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => del(f.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin fleteros</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Nuevo'} Fletero</h2>
            <div className="space-y-3">
              {[{ k: 'nombre', l: 'Nombre' }, { k: 'cuit', l: 'CUIT' }, { k: 'telefono', l: 'Teléfono' }, { k: 'email', l: 'Email' }].map(({ k, l }) => (
                <div key={k}><label className="block text-sm text-gray-600 mb-1">{l}</label>
                  <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              ))}
              <div><label className="block text-sm text-gray-600 mb-1">Forma de Pago</label>
                <select value={form.formaPago} onChange={e => setForm({ ...form, formaPago: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="TRANSFERENCIA">Transferencia</option><option value="EFECTIVO">Efectivo</option><option value="CHEQUE">Cheque</option>
                </select></div>
              <div><label className="block text-sm text-gray-600 mb-1">Plazo (días)</label>
                <input type="number" value={form.plazo} onChange={e => setForm({ ...form, plazo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Comisionista</label>
                <select value={form.comisionistaId} onChange={e => setForm({ ...form, comisionistaId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Sin comisionista</option>
                  {comisionistas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select></div>
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
