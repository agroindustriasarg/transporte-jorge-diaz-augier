import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Comisionista } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export default function Comisionistas() {
  const { token } = useAuth();
  const [items, setItems] = useState<Comisionista[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Comisionista | null>(null);
  const [form, setForm] = useState({ nombre: '', cuit: '', telefono: '', email: '' });

  const load = () => fetch(`${API}/comisionistas`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ nombre: '', cuit: '', telefono: '', email: '' }); setModal(true); };
  const openEdit = (c: Comisionista) => { setEditing(c); setForm({ nombre: c.nombre, cuit: c.cuit || '', telefono: c.telefono || '', email: c.email || '' }); setModal(true); };

  const save = async () => {
    const url = editing ? `${API}/comisionistas/${editing.id}` : `${API}/comisionistas`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setModal(false); load();
  };

  const del = async (id: string) => {
    if (!confirm('¿Eliminar comisionista?')) return;
    await fetch(`${API}/comisionistas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Comisionistas</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Nuevo</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-2 text-left">Nombre</th><th className="px-4 py-2 text-left">CUIT</th><th className="px-4 py-2 text-left">Teléfono</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{c.nombre}</td><td className="px-4 py-2">{c.cuit || '-'}</td>
                <td className="px-4 py-2">{c.telefono || '-'}</td><td className="px-4 py-2">{c.email || '-'}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => del(c.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin comisionistas</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Nuevo'} Comisionista</h2>
            <div className="space-y-3">
              {(['nombre', 'cuit', 'telefono', 'email'] as const).map(f => (
                <div key={f}><label className="block text-sm text-gray-600 mb-1 capitalize">{f}</label>
                  <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
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
