// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Pencil } from 'lucide-react';
import api from '../services/api';

const emptyForm = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  transporte: '',
  marcaCamion: '',
  patenteCamion: '',
  patenteAcoplado: '',
};

export default function Choferes() {
  const [choferes, setChoferes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => { loadChoferes(); }, []);

  const loadChoferes = async () => {
    try {
      const res = await api.get('/choferes');
      setChoferes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (chofer?: any) => {
    if (chofer) {
      setEditing(chofer);
      setFormData({
        nombre: chofer.nombre || '',
        apellido: chofer.apellido || '',
        dni: chofer.dni || '',
        telefono: chofer.telefono || '',
        transporte: chofer.transporte || '',
        marcaCamion: chofer.marcaCamion || '',
        patenteCamion: chofer.patenteCamion || '',
        patenteAcoplado: chofer.patenteAcoplado || '',
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
        await api.put(`/choferes/${editing.id}`, formData);
        alert('Chofer actualizado');
      } else {
        await api.post('/choferes', formData);
        alert('Chofer creado');
      }
      setShowForm(false);
      loadChoferes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar chofer');
    }
  };

  const handleToggle = async (id: string, activo: boolean) => {
    try {
      await api.put(`/choferes/${id}`, { activo });
      loadChoferes();
    } catch {
      alert('Error al cambiar estado');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar chofer "${nombre}"?`)) {
      try {
        await api.delete(`/choferes/${id}`);
        loadChoferes();
      } catch {
        alert('Error al eliminar chofer');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choferes</h1>
          <p className="text-gray-600 mt-1">Gestión de choferes</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Chofer</span>
        </button>
      </div>

      <div className="card">
        {choferes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No hay choferes registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Apellido', 'Nombre', 'DNI', 'Teléfono', 'Transporte', 'Marca Camión', 'Patente Camión', 'Patente Acoplado', 'Estado', 'Acciones'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {choferes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.apellido}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{c.nombre}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.dni || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.telefono || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.transporte || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.marcaCamion || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.patenteCamion || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.patenteAcoplado || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
                        <button onClick={() => handleDelete(c.id, `${c.nombre} ${c.apellido}`)} className="text-red-600 hover:text-red-900">
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
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {editing ? 'Editar Chofer' : 'Nuevo Chofer'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              {/* Fila 1: Nombre + Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input" required placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input type="text" value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="input" required placeholder="Pérez" />
                </div>
              </div>

              {/* Fila 2: DNI + Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input type="text" value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="input" placeholder="12.345.678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="input" placeholder="+54 11 1234-5678" />
                </div>
              </div>

              {/* Fila 3: Transporte + Marca Camión */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporte (empresa)</label>
                  <input type="text" value={formData.transporte}
                    onChange={(e) => setFormData({ ...formData, transporte: e.target.value })}
                    className="input" placeholder="Nombre de la empresa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca Camión</label>
                  <input type="text" value={formData.marcaCamion}
                    onChange={(e) => setFormData({ ...formData, marcaCamion: e.target.value })}
                    className="input" placeholder="Scania, Mercedes, Volvo..." />
                </div>
              </div>

              {/* Fila 4: Patente Camión + Patente Acoplado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patente Camión</label>
                  <input type="text" value={formData.patenteCamion}
                    onChange={(e) => setFormData({ ...formData, patenteCamion: e.target.value })}
                    className="input" placeholder="ABC 123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patente Acoplado</label>
                  <input type="text" value={formData.patenteAcoplado}
                    onChange={(e) => setFormData({ ...formData, patenteAcoplado: e.target.value })}
                    className="input" placeholder="XYZ 456" />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
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
