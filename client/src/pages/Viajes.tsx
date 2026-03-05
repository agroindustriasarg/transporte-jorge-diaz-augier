// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Pencil } from 'lucide-react';
import api from '../services/api';

const emptyForm = {
  fecha: new Date().toISOString().split('T')[0],
  chofer: '',
  patente: '',
  productoId: '',
  cpe: '',
  transporte: '',
  clienteId: '',
  proveedorId: '',
  kmRecorridos: '',
  kgCargados: '',
  kgDescargados: '',
  tarifaCliente: '',
  tarifaTransporte: '',
  descuento: '',
  precioPizarra: '',
  precioCompra: '',
  precioVenta: '',
};

export default function Viajes() {
  const [viajes, setViajes] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [choferes, setChoferes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  // Mini-modal para nuevo producto
  const [showNuevoProducto, setShowNuevoProducto] = useState(false);
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState('');
  const [savingProducto, setSavingProducto] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [vRes, cRes, pRes, chRes, prRes] = await Promise.all([
        api.get('/viajes'),
        api.get('/clientes'),
        api.get('/proveedores'),
        api.get('/choferes'),
        api.get('/productos'),
      ]);
      setViajes(vRes.data);
      setClientes(cRes.data);
      setProveedores(pRes.data);
      setChoferes(chRes.data);
      setProductos(prRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, val: string) => setFormData(f => ({ ...f, [key]: val }));

  const handleChoferChange = (choferId: string) => {
    const chofer = choferes.find(c => c.id === choferId);
    setFormData(f => ({
      ...f,
      chofer: choferId,
      transporte: chofer?.transporte || f.transporte,
      patente: chofer?.patenteCamion || f.patente,
    }));
  };

  const handleAgregarProducto = async () => {
    if (!nuevoProductoNombre.trim()) return;
    setSavingProducto(true);
    try {
      const res = await api.post('/productos', { nombre: nuevoProductoNombre.trim() });
      const nuevo = res.data;
      setProductos(prev => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setFormData(f => ({ ...f, productoId: nuevo.id }));
      setNuevoProductoNombre('');
      setShowNuevoProducto(false);
    } catch {
      alert('Error al crear producto');
    } finally {
      setSavingProducto(false);
    }
  };

  const handleOpen = (viaje?: any) => {
    if (viaje) {
      setEditing(viaje);
      setFormData({
        fecha: viaje.fecha ? viaje.fecha.split('T')[0] : '',
        chofer: viaje.chofer || '',
        patente: viaje.patente || '',
        productoId: viaje.productoId || '',
        cpe: viaje.cpe || '',
        transporte: viaje.transporte || '',
        clienteId: viaje.clienteId || '',
        proveedorId: viaje.proveedorId || '',
        kmRecorridos: viaje.kmRecorridos ?? '',
        kgCargados: viaje.kgCargados ?? '',
        kgDescargados: viaje.kgDescargados ?? '',
        tarifaCliente: viaje.tarifaCliente ?? '',
        tarifaTransporte: viaje.tarifaTransporte ?? '',
        descuento: viaje.descuento ?? '',
        precioPizarra: viaje.precioPizarra ?? '',
        precioCompra: viaje.precioCompra ?? '',
        precioVenta: viaje.precioVenta ?? '',
      });
    } else {
      setEditing(null);
      setFormData(emptyForm);
    }
    setError('');
    setShowNuevoProducto(false);
    setNuevoProductoNombre('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/viajes/${editing.id}`, formData);
        alert('Viaje actualizado');
      } else {
        await api.post('/viajes', formData);
        alert('Viaje creado');
      }
      setShowForm(false);
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar viaje');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este viaje?')) {
      try {
        await api.delete(`/viajes/${id}`);
        loadAll();
      } catch {
        alert('Error al eliminar viaje');
      }
    }
  };

  const fmt = (v: any, prefix = '') => v != null ? `${prefix}${Number(v).toLocaleString('es-AR')}` : '-';
  const formatFecha = (f: string) => f ? new Date(f).toLocaleDateString('es-AR') : '-';
  const clienteNombre = (id: string) => clientes.find(c => c.id === id)?.nombre || '-';
  const proveedorNombre = (id: string) => proveedores.find(p => p.id === id)?.nombre || '-';
  const choferNombre = (id: string) => { const c = choferes.find(x => x.id === id); return c ? `${c.apellido} ${c.nombre}` : (id || '-'); };
  const productoNombre = (id: string) => productos.find(p => p.id === id)?.nombre || '-';

  if (loading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
          <p className="text-gray-600 mt-1">Gestión de viajes</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Viaje</span>
        </button>
      </div>

      <div className="card">
        {viajes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No hay viajes registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Chofer', 'Patente', 'Transporte', 'Cliente', 'Proveedor', 'CPE', 'Carga', 'KM', 'KG Carg.', 'KG Desc.', 'T. Cliente', 'T. Transp.', 'Desc.', 'P. Pizarra', 'P. Compra', 'P. Venta', 'Acciones'].map((col) => (
                    <th key={col} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viajes.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{formatFecha(v.fecha)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{v.chofer ? choferNombre(v.chofer) : '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{v.patente || '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{v.transporte || '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{v.clienteId ? clienteNombre(v.clienteId) : '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{v.proveedorId ? proveedorNombre(v.proveedorId) : '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{v.cpe || '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{v.productoId ? productoNombre(v.productoId) : '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.kmRecorridos)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.kgCargados)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.kgDescargados)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.tarifaCliente, '$')}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.tarifaTransporte, '$')}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.descuento)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.precioPizarra, '$')}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.precioCompra, '$')}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{fmt(v.precioVenta, '$')}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button onClick={() => handleOpen(v)} className="text-blue-600 hover:text-blue-900">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-900">
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

      {/* Modal Viaje */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {editing ? 'Editar Viaje' : 'Nuevo Viaje'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" value={formData.fecha} onChange={e => set('fecha', e.target.value)} className="input" required />
              </div>

              {/* Chofer + Patente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chofer</label>
                  <select value={formData.chofer} onChange={e => handleChoferChange(e.target.value)} className="input">
                    <option value="">— Sin chofer —</option>
                    {choferes.map(c => (
                      <option key={c.id} value={c.id}>{c.apellido} {c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                  <input type="text" value={formData.patente} onChange={e => set('patente', e.target.value)} className="input" placeholder="ABC 123" />
                </div>
              </div>

              {/* Transporte + CPE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporte</label>
                  <input type="text" value={formData.transporte} onChange={e => set('transporte', e.target.value)} className="input" placeholder="Empresa de transporte" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPE</label>
                  <input type="text" value={formData.cpe} onChange={e => set('cpe', e.target.value)} className="input" placeholder="N° CPE" />
                </div>
              </div>

              {/* Cliente + Proveedor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select value={formData.clienteId} onChange={e => set('clienteId', e.target.value)} className="input">
                    <option value="">— Sin cliente —</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select value={formData.proveedorId} onChange={e => set('proveedorId', e.target.value)} className="input">
                    <option value="">— Sin proveedor —</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Carga (Producto) + KM */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carga</label>
                  <div className="flex gap-2">
                    <select value={formData.productoId} onChange={e => set('productoId', e.target.value)} className="input flex-1">
                      <option value="">— Sin carga —</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNuevoProducto(v => !v)}
                      className="btn bg-green-600 hover:bg-green-700 text-white px-2 flex-shrink-0"
                      title="Agregar producto"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Inline: nuevo producto */}
                  {showNuevoProducto && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={nuevoProductoNombre}
                        onChange={e => setNuevoProductoNombre(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAgregarProducto())}
                        className="input flex-1"
                        placeholder="Nombre del producto"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAgregarProducto}
                        disabled={savingProducto}
                        className="btn bg-green-600 hover:bg-green-700 text-white px-3 flex-shrink-0"
                      >
                        {savingProducto ? '...' : 'Agregar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNuevoProducto(false); setNuevoProductoNombre(''); }}
                        className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KM Recorridos</label>
                  <input type="number" step="0.01" value={formData.kmRecorridos} onChange={e => set('kmRecorridos', e.target.value)} className="input" placeholder="0" />
                </div>
              </div>

              {/* KG Cargados + KG Descargados */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KG Cargados</label>
                  <input type="number" step="0.01" value={formData.kgCargados} onChange={e => set('kgCargados', e.target.value)} className="input" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KG Descargados</label>
                  <input type="number" step="0.01" value={formData.kgDescargados} onChange={e => set('kgDescargados', e.target.value)} className="input" placeholder="0" />
                </div>
              </div>

              {/* Tarifa Cliente + Tarifa Transporte */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Cliente ($)</label>
                  <input type="number" step="0.01" value={formData.tarifaCliente} onChange={e => set('tarifaCliente', e.target.value)} className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Transporte ($)</label>
                  <input type="number" step="0.01" value={formData.tarifaTransporte} onChange={e => set('tarifaTransporte', e.target.value)} className="input" placeholder="0.00" />
                </div>
              </div>

              {/* Descuento + Precio Pizarra */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descuento</label>
                  <input type="number" step="0.01" value={formData.descuento} onChange={e => set('descuento', e.target.value)} className="input" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Pizarra ($)</label>
                  <input type="number" step="0.01" value={formData.precioPizarra} onChange={e => set('precioPizarra', e.target.value)} className="input" placeholder="0.00" />
                </div>
              </div>

              {/* Precio Compra + Precio Venta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra ($)</label>
                  <input type="number" step="0.01" value={formData.precioCompra} onChange={e => set('precioCompra', e.target.value)} className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta ($)</label>
                  <input type="number" step="0.01" value={formData.precioVenta} onChange={e => set('precioVenta', e.target.value)} className="input" placeholder="0.00" />
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
