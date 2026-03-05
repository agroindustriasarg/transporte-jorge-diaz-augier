// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, X, ArrowLeft, Filter, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const MONEDAS = [
  { code: 'ARS', label: 'Pesos (ARS)', simbolo: '$' },
  { code: 'USD', label: 'Dólares (USD)', simbolo: 'US$' },
  { code: 'BRL', label: 'Reales (BRL)', simbolo: 'R$' },
  { code: 'PYG', label: 'Guaraníes (PYG)', simbolo: '₲' },
];

const FORMAS_PAGO = ['Transferencia', 'Efectivo', 'Tarjeta de Crédito', 'Cheque'];

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}

function formatMoneda(n: number, code: string) {
  const m = MONEDAS.find((m) => m.code === code);
  return `${m?.simbolo || ''} ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(n)}`;
}

function FormaPagoBadge({ fp }: { fp: string | null }) {
  if (!fp) return <span className="text-gray-400">—</span>;
  const colors: Record<string, string> = {
    'Transferencia':     'bg-blue-100 text-blue-700',
    'Efectivo':          'bg-green-100 text-green-700',
    'Tarjeta de Crédito':'bg-purple-100 text-purple-700',
    'Cheque':            'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[fp] || 'bg-gray-100 text-gray-700'}`}>
      {fp}
    </span>
  );
}

type Entidad = { id: string; nombre: string };
type Pago = {
  id: string; tipo: string; entidadId: string | null; entidadNombre: string | null;
  concepto: string | null; moneda: string; cotizacion: number; monto: number; montoARS: number; fecha: string;
  formaPago: string | null;
  chequeNumero: string | null; chequeBanco: string | null; chequeEmpresa: string | null; chequeFechaCobro: string | null;
};

type Props = {
  tipo: 'proveedor' | 'cliente' | 'transporte';
  titulo: string;
  entidades: Entidad[];
  entidadLabel: string;
};

const emptyForm = {
  entidadId: '', concepto: '', moneda: 'ARS', cotizacion: '1', monto: '',
  fecha: new Date().toISOString().split('T')[0],
  formaPago: '',
  chequeNumero: '', chequeBanco: '', chequeEmpresa: '', chequeFechaCobro: '',
};

export default function PagosModulo({ tipo, titulo, entidades, entidadLabel }: Props) {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPagos = async () => {
    try {
      const res = await fetch(`${API_URL}/pagos?tipo=${tipo}`, { headers });
      const data = await res.json();
      setPagos(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPagos(); }, []);

  const monedaSeleccionada = MONEDAS.find((m) => m.code === form.moneda)!;
  const montoARS = parseFloat(form.monto || '0') * parseFloat(form.cotizacion || '1');

  const handleMonedaChange = (code: string) => {
    setForm({ ...form, moneda: code, cotizacion: code === 'ARS' ? '1' : form.cotizacion });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const entidad = entidades.find((e) => e.id === form.entidadId);
      await fetch(`${API_URL}/pagos`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          entidadId: form.entidadId || null,
          entidadNombre: entidad?.nombre || null,
          concepto: form.concepto,
          moneda: form.moneda,
          cotizacion: parseFloat(form.cotizacion) || 1,
          monto: parseFloat(form.monto) || 0,
          fecha: form.fecha,
          formaPago: form.formaPago || null,
          chequeNumero: form.chequeNumero || null,
          chequeBanco: form.chequeBanco || null,
          chequeEmpresa: form.chequeEmpresa || null,
          chequeFechaCobro: form.chequeFechaCobro || null,
        }),
      });
      await fetchPagos();
      setShowModal(false);
      setForm({ ...emptyForm });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este pago?')) return;
    await fetch(`${API_URL}/pagos/${id}`, { method: 'DELETE', headers });
    await fetchPagos();
  };

  const [filtros, setFiltros] = useState({ entidadId: '', fechaDesde: '', fechaHasta: '' });

  const filtered = useMemo(() => {
    return pagos.filter((p) => {
      if (filtros.entidadId && p.entidadId !== filtros.entidadId) return false;
      if (filtros.fechaDesde && new Date(p.fecha) < new Date(filtros.fechaDesde)) return false;
      if (filtros.fechaHasta) {
        const hasta = new Date(filtros.fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        if (new Date(p.fecha) > hasta) return false;
      }
      return true;
    });
  }, [pagos, filtros]);

  const totalFiltrado = filtered.reduce((acc, p) => acc + p.montoARS, 0);
  const hasFilters = Object.values(filtros).some((v) => v !== '');

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const hoy = new Date().toLocaleDateString('es-AR');

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(titulo, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${hoy}  |  ${filtered.length} pago${filtered.length !== 1 ? 's' : ''}`, 14, 26);

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total ARS: ${formatARS(totalFiltrado)}`, 14, 33);

    const rows = filtered.map((p) => [
      new Date(p.fecha).toLocaleDateString('es-AR'),
      p.entidadNombre || '—',
      p.concepto || '—',
      p.formaPago || '—',
      p.moneda,
      formatMoneda(p.monto, p.moneda),
      p.moneda === 'ARS' ? '—' : `${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(p.cotizacion)}`,
      formatARS(p.montoARS),
    ]);

    const footerRow = ['', '', '', '', '', '', 'TOTAL ARS', formatARS(totalFiltrado)];

    autoTable(doc, {
      head: [['Fecha', entidadLabel, 'Concepto', 'Forma de Pago', 'Moneda', 'Monto', 'Cotiz.', 'Total ARS']],
      body: rows,
      foot: [footerRow],
      startY: 38,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [243, 244, 246], textColor: [30, 30, 30], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right', fontStyle: 'bold' },
      },
    });

    doc.save(`${tipo}-pagos-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pagos')} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Pagos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{titulo}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!loading && filtered.length > 0 && (
            <button onClick={generarPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
              <FileDown className="w-4 h-4" /> Generar PDF
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Añadir Pago
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" /> Filtros
          </div>
          {hasFilters && (
            <button onClick={() => setFiltros({ entidadId: '', fechaDesde: '', fechaHasta: '' })} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{entidadLabel}</label>
            <select value={filtros.entidadId} onChange={(e) => setFiltros((p) => ({ ...p, entidadId: e.target.value }))} className="input text-sm">
              <option value="">Todos</option>
              {entidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha desde</label>
            <input type="date" value={filtros.fechaDesde} onChange={(e) => setFiltros((p) => ({ ...p, fechaDesde: e.target.value }))} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha hasta</label>
            <input type="date" value={filtros.fechaHasta} onChange={(e) => setFiltros((p) => ({ ...p, fechaHasta: e.target.value }))} className="input text-sm" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-gray-500 py-10">{pagos.length === 0 ? 'No hay pagos registrados' : 'No hay pagos para los filtros seleccionados'}</div>
      ) : (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{entidadLabel}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Concepto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Forma de Pago</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Moneda</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Cotiz.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total ARS</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-gray-700">{p.entidadNombre || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.concepto || '—'}</td>
                  <td className="px-4 py-3">
                    <FormaPagoBadge fp={p.formaPago} />
                    {p.formaPago === 'Cheque' && p.chequeNumero && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        #{p.chequeNumero}{p.chequeBanco ? ` · ${p.chequeBanco}` : ''}{p.chequeFechaCobro ? ` · ${new Date(p.chequeFechaCobro).toLocaleDateString('es-AR')}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{p.moneda}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatMoneda(p.monto, p.moneda)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {p.moneda === 'ARS' ? '—' : `1 ${p.moneda} = ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(p.cotizacion)} ARS`}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatARS(p.montoARS)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={7} className="px-4 py-3 text-right font-semibold text-gray-700">
                  Total ARS{hasFilters ? ' (filtrado)' : ''}:
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 text-base">
                  {formatARS(totalFiltrado)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo Pago</h2>
              <button onClick={() => { setShowModal(false); setForm({ ...emptyForm }); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{entidadLabel}</label>
                <select value={form.entidadId} onChange={(e) => setForm({ ...form, entidadId: e.target.value })} className="input">
                  <option value="">— Seleccionar —</option>
                  {entidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input type="text" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} className="input" placeholder="Ej: Factura 0001-0012345" />
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAS_PAGO.map((fp) => (
                    <button key={fp} type="button"
                      onClick={() => setForm({ ...form, formaPago: form.formaPago === fp ? '' : fp })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors text-left ${form.formaPago === fp ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 text-gray-700 hover:border-primary-400'}`}>
                      {fp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-formulario Cheque */}
              {form.formaPago === 'Cheque' && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-yellow-700">Datos del cheque</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">N° de Cheque</label>
                      <input type="text" value={form.chequeNumero} onChange={(e) => setForm({ ...form, chequeNumero: e.target.value })} className="input py-1.5 text-sm" placeholder="Ej: 00012345" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Banco</label>
                      <input type="text" value={form.chequeBanco} onChange={(e) => setForm({ ...form, chequeBanco: e.target.value })} className="input py-1.5 text-sm" placeholder="Ej: Banco Nación" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
                      <input type="text" value={form.chequeEmpresa} onChange={(e) => setForm({ ...form, chequeEmpresa: e.target.value })} className="input py-1.5 text-sm" placeholder="Ej: Razón Social SA" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Cobro</label>
                      <input type="date" value={form.chequeFechaCobro} onChange={(e) => setForm({ ...form, chequeFechaCobro: e.target.value })} className="input py-1.5 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <div className="grid grid-cols-4 gap-2">
                  {MONEDAS.map((m) => (
                    <button key={m.code} type="button"
                      onClick={() => handleMonedaChange(m.code)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${form.moneda === m.code ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 text-gray-700 hover:border-primary-400'}`}>
                      {m.code}
                    </button>
                  ))}
                </div>
              </div>

              {form.moneda !== 'ARS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cotización: 1 {form.moneda} = <span className="text-primary-600">? ARS</span>
                  </label>
                  <input type="number" required min="0" step="0.01" value={form.cotizacion}
                    onChange={(e) => setForm({ ...form, cotizacion: e.target.value })}
                    className="input" placeholder="Ej: 1050" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto ({monedaSeleccionada.simbolo})
                </label>
                <input type="number" required min="0" step="0.01" value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  className="input" placeholder="0.00" />
              </div>

              {form.moneda !== 'ARS' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                  <span className="font-medium">Equivalente en ARS: </span>
                  {formatARS(montoARS)}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Guardando...' : 'Guardar Pago'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setForm({ ...emptyForm }); }} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
