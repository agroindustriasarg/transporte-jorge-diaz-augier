// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Pencil } from 'lucide-react';
import api from '../services/api';

const emptyForm = { nombre: '', cuit: '', telefono: '', email: '', direccion: '', contacto: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => { loadClientes(); }, []);

  const loadClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (cliente?: any) => {
    if (cliente) {
      setEditing(cliente);
      setFormData({
        nombre: cliente.nombre,
        cuit: cliente.cuit || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        contacto: cliente.contacto || '',
      });
    } else {
      setEditing(null);
      setFormData(emptyForm);
    }
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/clientes/${editing.id}`, formData);
        alert('Cliente actualizado');
      } else {
        await api.post('/clientes', formData);
        alert('Cliente creado');
      }
      setShowForm(false);
      loadClientes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar cliente');
    }
  };

  const handleToggle = async (id: string, activo: boolean) => {
    try {
      await api.put(`/clientes/${id}`, { activo });
      loadClientes();
    } catch {
      alert('Error al cambiar estado');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar cliente "${nombre}"?`)) {
      try {
        await api.delete(`/clientes/${id}`);
        loadClientes();
      } catch {
        alert('Error al eliminar cliente');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestión de clientes</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="card">
        {clientes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No hay clientes registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Nombre', 'CUIT', 'Teléfono', 'Email', 'Contacto', 'Estado', 'Acciones'].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.cuit || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.telefono || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.contacto || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggle(c.id, !c.activo)}
                          className={c.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {c.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => handleOpen(c)} className="text-blue-600 hover:text-blue-900">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.nombre)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              {[
                { label: 'Nombre', key: 'nombre', required: true, placeholder: 'Nombre del cliente' },
                { label: 'CUIT', key: 'cuit', required: false, placeholder: '20-12345678-9' },
                { label: 'Teléfono', key: 'telefono', required: false, placeholder: '+54 11 1234-5678' },
                { label: 'Email', key: 'email', required: false, placeholder: 'cliente@email.com' },
                { label: 'Dirección', key: 'direccion', required: false, placeholder: 'Av. Corrientes 1234' },
                { label: 'Contacto', key: 'contacto', required: false, placeholder: 'Nombre del contacto' },
              ].map(({ label, key, required, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="input"
                    required={required}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn bg-gray-200 hover:bg-gray-300 text-gray-700">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn bg-green-600 hover:bg-green-700 text-white">
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
