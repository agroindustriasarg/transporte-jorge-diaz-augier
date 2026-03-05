// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, X, UserCog, Truck, Briefcase, Users, Trash2, Pencil } from 'lucide-react';
import api from '../services/api';

const roles = [
  {
    id: 'ADMIN',
    nombre: 'Admin',
    descripcion: 'Control total del sistema',
    icon: UserCog,
    color: 'bg-red-500',
  },
  {
    id: 'OPERARIO',
    nombre: 'Choferes',
    descripcion: 'Conductores de la flota',
    icon: Truck,
    color: 'bg-blue-500',
  },
  {
    id: 'GERENTE',
    nombre: 'Administracion',
    descripcion: 'Gestion administrativa',
    icon: Briefcase,
    color: 'bg-green-500',
  },
  {
    id: 'VISOR',
    nombre: 'Cliente',
    descripcion: 'Acceso de cliente',
    icon: Users,
    color: 'bg-purple-500',
  },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ id: string; nombre: string } | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    empresa: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId: string, roleName: string) => {
    setSelectedRole({ id: roleId, nombre: roleName });
    setShowModal(false);
    setShowForm(true);
    setFormData({ usuario: '', password: '', nombre: '', empresa: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        const updateData: any = {
          nombre: formData.nombre,
          email: formData.empresa,
          apellido: selectedRole?.nombre || '',
          rol: selectedRole?.id,
        };
        if (formData.password) updateData.password = formData.password;
        await api.put(`/usuarios/${editingUser.id}`, updateData);
        alert('Usuario actualizado exitosamente');
      } else {
        await api.post('/auth/register', {
          usuario: formData.usuario,
          password: formData.password,
          nombre: formData.nombre,
          email: formData.empresa,
          apellido: selectedRole?.nombre || '',
          rol: selectedRole?.id,
        });
        alert('Usuario creado exitosamente');
      }
      setShowForm(false);
      setSelectedRole(null);
      setEditingUser(null);
      loadUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedRole(null);
    setEditingUser(null);
    setFormData({ usuario: '', password: '', nombre: '', empresa: '' });
    setError('');
  };

  const handleEdit = (usuario: any) => {
    setEditingUser(usuario);
    setSelectedRole({ id: usuario.rol, nombre: usuario.apellido });
    setFormData({ usuario: usuario.usuario, password: '', nombre: usuario.nombre, empresa: usuario.email });
    setShowForm(true);
  };

  const handleToggleEstado = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/usuarios/${id}`, { activo });
      loadUsuarios();
    } catch (error) {
      alert('Error al cambiar el estado del usuario');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"?`)) {
      try {
        await api.delete(`/usuarios/${id}`);
        loadUsuarios();
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el usuario');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="card">
        {usuarios.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No hay usuarios registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Usuario', 'Nombre', 'Tipo', 'Empresa', 'Estado', 'Acciones'].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.usuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.apellido === 'Admin' ? 'bg-red-100 text-red-800' :
                        usuario.apellido === 'Choferes' ? 'bg-blue-100 text-blue-800' :
                        usuario.apellido === 'Administracion' ? 'bg-green-100 text-green-800' :
                        usuario.apellido === 'Cliente' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.apellido || usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleEstado(usuario.id, !usuario.activo)}
                          className={usuario.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {usuario.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => handleEdit(usuario)} className="text-blue-600 hover:text-blue-900">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(usuario.id, usuario.nombre)} className="text-red-600 hover:text-red-900">
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

      {/* Modal selección de rol */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Selecciona el tipo de usuario</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id, role.nombre)}
                    className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`${role.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.nombre}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.descripcion}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Formulario crear/editar */}
      {showForm && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? `Editar ${selectedRole.nombre}` : `Crear ${selectedRole.nombre}`}
              </h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  className="input"
                  required={!editingUser}
                  disabled={!!editingUser}
                  placeholder="nombre_usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingUser && <span className="text-gray-500 text-xs">(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  required={!editingUser}
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del usuario</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                  required
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="input"
                  required
                  placeholder="Empresa SRL"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={handleCancel} className="flex-1 btn bg-gray-200 hover:bg-gray-300 text-gray-700">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn bg-green-600 hover:bg-green-700 text-white">
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
