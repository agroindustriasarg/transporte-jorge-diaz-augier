import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Viaje, Cliente, Ruta, Fletero, Comisionista, TipoIVA, EstadoViaje } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const emptyForm = () => ({
  fecha: new Date().toISOString().split('T')[0],
  clienteId: '', rutaId: '', origen: '', destino: '', tipoCarga: '',
  cantCarga: '', tarifaSinIVA: '', tipoIVA: 'EXENTO' as TipoIVA,
  valorIVA: '0', valorViaje: '', totalViaje: '',
  comision: '0', comisionistaId: '', fleteroId: '',
  remito: '', fcNro: '', fechaRecepcion: '',
  estadoViaje: 'PENDIENTE' as EstadoViaje, estadoPago: 'PENDIENTE',
  observaciones: '',
});
type FormType = ReturnType<typeof emptyForm>;

export default function Viajes() {
  const { token } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [fleteros, setFleteros] = useState<Fletero[]>([]);
  const [comisionistas, setComisionistas] = useState<Comisionista[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Viaje | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm());
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCliente, setFilterCliente] = useState('');

  const loadViajes = () =>
    fetch(`${API}/viajes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setViajes).catch(() => {});

  useEffect(() => {
    loadViajes();
    fetch(`${API}/clientes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setClientes);
    fetch(`${API}/rutas`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setRutas);
    fetch(`${API}/fleteros`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setFleteros);
    fetch(`${API}/comisionistas`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setComisionistas);
  }, [token]);

  const recalculate = (f: FormType): FormType => {
    const cant = parseFloat(f.cantCarga) || 0;
    const tarifa = parseFloat(f.tarifaSinIVA) || 0;
    const valorViaje = cant * tarifa;
    let valorIVA = 0;
    if (f.tipoIVA === 'IVA_21') valorIVA = valorViaje * 0.21;
    else if (f.tipoIVA === 'IVA_10_5') valorIVA = valorViaje * 0.105;
    const totalViaje = valorViaje + valorIVA;
    return {
      ...f,
      valorViaje: valorViaje ? valorViaje.toFixed(2) : '',
      valorIVA: valorIVA.toFixed(2),
      totalViaje: totalViaje ? totalViaje.toFixed(2) : '',
    };
  };

  const setField = (key: keyof FormType, value: string) => {
    const nf = { ...form, [key]: value };
    setForm(['cantCarga', 'tarifaSinIVA', 'tipoIVA'].includes(key) ? recalculate(nf) : nf);
  };

  const handleRutaChange = (rutaId: string) => {
    const ruta = rutas.find(r => r.id === rutaId);
    if (ruta) {
      setForm(recalculate({
        ...form, rutaId, destino: ruta.destino,
        tipoCarga: ruta.tipoCarga || form.tipoCarga,
        tarifaSinIVA: String(ruta.tarifaSinIVA),
        comision: String(ruta.comision),
      }));
    } else {
      setForm({ ...form, rutaId });
    }
  };

  const handleFleteroChange = (fleteroId: string) => {
    const fl = fleteros.find(f => f.id === fleteroId);
    setForm({ ...form, fleteroId, comisionistaId: fl?.comisionistaId || form.comisionistaId });
  };

  const clienteRutas = rutas.filter(r => !form.clienteId || r.clienteId === form.clienteId);

  const openNew = () => { setEditing(null); setForm(emptyForm()); setModal(true); };

  const openEdit = (v: Viaje) => {
    setEditing(v);
    setForm({
      fecha: v.fecha.split('T')[0],
      clienteId: v.clienteId, rutaId: v.rutaId || '',
      origen: v.origen, destino: v.destino, tipoCarga: v.tipoCarga || '',
      cantCarga: v.cantCarga !== undefined ? String(v.cantCarga) : '',
      tarifaSinIVA: v.tarifaSinIVA !== undefined ? String(v.tarifaSinIVA) : '',
      tipoIVA: v.tipoIVA,
      valorIVA: v.valorIVA !== undefined ? String(v.valorIVA) : '0',
      valorViaje: v.valorViaje !== undefined ? String(v.valorViaje) : '',
      totalViaje: v.totalViaje !== undefined ? String(v.totalViaje) : '',
      comision: v.comision !== undefined ? String(v.comision) : '0',
      comisionistaId: v.comisionistaId || '', fleteroId: v.fleteroId || '',
      remito: v.remito || '', fcNro: v.fcNro || '',
      fechaRecepcion: v.fechaRecepcion ? v.fechaRecepcion.split('T')[0] : '',
      estadoViaje: v.estadoViaje, estadoPago: v.estadoPago,
      observaciones: v.observaciones || '',
    });
    setModal(true);
  };

  const save = async () => {
    const url = editing ? `${API}/viajes/${editing.id}` : `${API}/viajes`;
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { setModal(false); loadViajes(); }
    else { const err = await res.json(); alert(err.error || 'Error al guardar'); }
  };

  const del = async (id: string) => {
    if (!window.confirm('Eliminar viaje?')) return;
    await fetch(`${API}/viajes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadViajes();
  };

  const fmt = (n?: number) => n !== undefined ? `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-AR');

  const estadoColor: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    EN_CURSO: 'bg-blue-100 text-blue-800',
    COMPLETADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  };
  const pagoColor: Record<string, string> = {
    PENDIENTE: 'bg-orange-100 text-orange-800',
    PAGADO: 'bg-green-100 text-green-800',
  };

  const filtered = viajes.filter(v =>
    (!filterEstado || v.estadoViaje === filterEstado) &&
    (!filterCliente || v.clienteId === filterCliente)
  );

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
  const inp = 'w-full border rounded-lg px-3 py-2 text-sm';
  const sel = 'w-full border rounded-lg px-3 py-2 text-sm bg-white';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Viajes</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Nuevo Viaje</button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_CURSO">En Curso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <select value={filterCliente} onChange={e => setFilterCliente(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todos los clientes</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center">{filtered.length} viajes</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Origen - Destino</th>
              <th className="px-3 py-2 text-left">Fletero</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Pago</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{fmtDate(v.fecha)}</td>
                <td className="px-3 py-2">{v.cliente?.nombre || '-'}</td>
                <td className="px-3 py-2">{v.origen} - {v.destino}</td>
                <td className="px-3 py-2">{v.fletero?.nombre || '-'}</td>
                <td className="px-3 py-2 text-right">{fmt(v.totalViaje)}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[v.estadoViaje]}`}>{v.estadoViaje}</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pagoColor[v.estadoPago]}`}>{v.estadoPago}</span>
                </td>
                <td className="px-3 py-2 text-center space-x-2">
                  <button onClick={() => openEdit(v)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => del(v.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin viajes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl my-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Nuevo'} Viaje</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">x</button>
            </div>
            <div className="p-6 space-y-6">

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos del Viaje</h3>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Fecha">
                    <input type="date" value={form.fecha} onChange={e => setField('fecha', e.target.value)} className={inp} />
                  </F>
                  <F label="Cliente">
                    <select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value, rutaId: '' })} className={sel}>
                      <option value="">Seleccionar...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </F>
                  <F label="Ruta">
                    <select value={form.rutaId} onChange={e => handleRutaChange(e.target.value)} className={sel}>
                      <option value="">Sin ruta predefinida</option>
                      {clienteRutas.map(r => <option key={r.id} value={r.id}>{r.origen} - {r.destino}</option>)}
                    </select>
                  </F>
                  <F label="Tipo de Carga">
                    <input value={form.tipoCarga} onChange={e => setField('tipoCarga', e.target.value)} className={inp} />
                  </F>
                  <F label="Origen">
                    <input value={form.origen} onChange={e => setField('origen', e.target.value)} className={inp} />
                  </F>
                  <F label="Destino">
                    <input value={form.destino} onChange={e => setField('destino', e.target.value)} className={inp} />
                  </F>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tarifas</h3>
                <div className="grid grid-cols-3 gap-3">
                  <F label="Cant. Carga (tn)">
                    <input type="number" value={form.cantCarga} onChange={e => setField('cantCarga', e.target.value)} className={inp} />
                  </F>
                  <F label="Tarifa s/IVA">
                    <input type="number" value={form.tarifaSinIVA} onChange={e => setField('tarifaSinIVA', e.target.value)} className={inp} />
                  </F>
                  <F label="Tipo IVA">
                    <select value={form.tipoIVA} onChange={e => setField('tipoIVA', e.target.value)} className={sel}>
                      <option value="EXENTO">Exento</option>
                      <option value="IVA_10_5">10.5%</option>
                      <option value="IVA_21">21%</option>
                    </select>
                  </F>
                  <F label="Valor del Viaje">
                    <input type="number" value={form.valorViaje} onChange={e => setField('valorViaje', e.target.value)} className={`${inp} bg-gray-50`} />
                  </F>
                  <F label="Valor IVA">
                    <input type="number" value={form.valorIVA} readOnly className={`${inp} bg-gray-50`} />
                  </F>
                  <F label="Total Viaje">
                    <input type="number" value={form.totalViaje} onChange={e => setField('totalViaje', e.target.value)} className={`${inp} bg-gray-50 font-semibold`} />
                  </F>
                  <F label="Comision">
                    <input type="number" value={form.comision} onChange={e => setField('comision', e.target.value)} className={inp} />
                  </F>
                  <div className="col-span-2">
                    <F label="Comisionista">
                      <select value={form.comisionistaId} onChange={e => setField('comisionistaId', e.target.value)} className={sel}>
                        <option value="">Sin comisionista</option>
                        {comisionistas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </F>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Transporte</h3>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Fletero">
                    <select value={form.fleteroId} onChange={e => handleFleteroChange(e.target.value)} className={sel}>
                      <option value="">Sin fletero</option>
                      {fleteros.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </F>
                  <F label="Remito">
                    <input value={form.remito} onChange={e => setField('remito', e.target.value)} className={inp} />
                  </F>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Factura</h3>
                <div className="grid grid-cols-2 gap-3">
                  <F label="N Factura">
                    <input value={form.fcNro} onChange={e => setField('fcNro', e.target.value)} className={inp} />
                  </F>
                  <F label="Fecha Recepcion">
                    <input type="date" value={form.fechaRecepcion} onChange={e => setField('fechaRecepcion', e.target.value)} className={inp} />
                  </F>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estado</h3>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Estado del Viaje">
                    <select value={form.estadoViaje} onChange={e => setField('estadoViaje', e.target.value)} className={sel}>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_CURSO">En Curso</option>
                      <option value="COMPLETADO">Completado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </F>
                  <F label="Estado de Pago">
                    <select value={form.estadoPago} onChange={e => setField('estadoPago', e.target.value)} className={sel}>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="PAGADO">Pagado</option>
                    </select>
                  </F>
                  <div className="col-span-2">
                    <F label="Observaciones">
                      <textarea value={form.observaciones} onChange={e => setField('observaciones', e.target.value)} className={`${inp} resize-none`} rows={2} />
                    </F>
                  </div>
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t flex gap-2 justify-end">
              <button onClick={() => setModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
              <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar Viaje</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
