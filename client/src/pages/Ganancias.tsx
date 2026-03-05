// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, X, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

type Viaje = {
  id: string;
  fecha: string;
  clienteId: string | null;
  chofer: string | null;
  productoId: string | null;
  kgCargados: number | null;
  kgDescargados: number | null;
  precioVenta: number | null;
  precioCompra: number | null;
  tarifaTransporte: number | null;
  cpe: string | null;
};

type Entidad = { id: string; nombre: string };
type Producto = { id: string; nombre: string };
type Chofer = { id: string; nombre: string; apellido: string };

function fmtPesos(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}
function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(n);
}

const emptyFiltros = { clienteId: '', fechaDesde: '', fechaHasta: '', productoId: '', chofer: '' };

export default function Ganancias() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [clientes, setClientes] = useState<Entidad[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ ...emptyFiltros });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vRes, cRes, prodRes, chRes] = await Promise.all([
          fetch(`${API_URL}/viajes`, { headers }),
          fetch(`${API_URL}/clientes`, { headers }),
          fetch(`${API_URL}/productos`, { headers }),
          fetch(`${API_URL}/choferes`, { headers }),
        ]);
        setViajes(await vRes.json());
        setClientes(await cRes.json());
        setProductos(await prodRes.json());
        setChoferes(await chRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const getNombre = (list: Entidad[], id: string | null) =>
    id ? (list.find((e) => e.id === id)?.nombre || '—') : '—';

  const getProducto = (id: string | null) =>
    id ? (productos.find((p) => p.id === id)?.nombre || '—') : '—';

  const getChofer = (id: string | null) => {
    if (!id) return '—';
    const c = choferes.find((ch) => ch.id === id);
    return c ? `${c.nombre} ${c.apellido}` : '—';
  };

  const setFiltro = (key: string, value: string) =>
    setFiltros((prev) => ({ ...prev, [key]: value }));

  const clearFiltros = () => setFiltros({ ...emptyFiltros });

  const hasFilters = Object.values(filtros).some((v) => v !== '');

  const filtered = useMemo(() => {
    return viajes.filter((v) => {
      const fecha = new Date(v.fecha);
      if (filtros.fechaDesde && fecha < new Date(filtros.fechaDesde)) return false;
      if (filtros.fechaHasta) {
        const hasta = new Date(filtros.fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        if (fecha > hasta) return false;
      }
      if (filtros.clienteId && v.clienteId !== filtros.clienteId) return false;
      if (filtros.productoId && v.productoId !== filtros.productoId) return false;
      if (filtros.chofer && v.chofer !== filtros.chofer) return false;
      return true;
    });
  }, [viajes, filtros]);

  const uniqueChoferes = useMemo(() => {
    const ids = [...new Set(viajes.map((v) => v.chofer).filter(Boolean))] as string[];
    return ids
      .map((id) => {
        const c = choferes.find((ch) => ch.id === id);
        return { id, label: c ? `${c.nombre} ${c.apellido}` : id };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [viajes, choferes]);

  const totales = useMemo(() => {
    let venta = 0, compra = 0, flete = 0;
    for (const v of filtered) {
      const kg = (v.kgDescargados || v.kgCargados || 0) / 1000;
      venta += kg * (v.precioVenta || 0);
      compra += kg * (v.precioCompra || 0);
      flete += kg * (v.tarifaTransporte || 0);
    }
    return { venta, compra, flete, ganancia: venta - compra - flete };
  }, [filtered]);

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const fecha = new Date().toLocaleDateString('es-AR');

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text('Reporte de Ganancias', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${fecha}  |  ${filtered.length} viaje${filtered.length !== 1 ? 's' : ''}`, 14, 26);

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const resumenTexto = [
      `Total Venta: ${fmtPesos(totales.venta)}`,
      `Total Compra: ${fmtPesos(totales.compra)}`,
      `Total Flete: ${fmtPesos(totales.flete)}`,
      `Ganancia Neta: ${fmtPesos(totales.ganancia)}`,
    ].join('    ');
    doc.text(resumenTexto, 14, 33);

    const rows = filtered.map((v) => {
      const kg = (v.kgDescargados || v.kgCargados || 0) / 1000;
      const venta   = kg * (v.precioVenta || 0);
      const compra  = kg * (v.precioCompra || 0);
      const flete   = kg * (v.tarifaTransporte || 0);
      const ganancia = venta - compra - flete;
      return [
        new Date(v.fecha).toLocaleDateString('es-AR'),
        v.cpe || '—',
        getNombre(clientes, v.clienteId),
        getChofer(v.chofer),
        getProducto(v.productoId),
        fmt(v.kgDescargados || v.kgCargados),
        fmtPesos(venta),
        fmtPesos(compra),
        fmtPesos(flete),
        fmtPesos(ganancia),
      ];
    });

    const footerRow = ['', '', '', '', 'TOTAL', '', fmtPesos(totales.venta), fmtPesos(totales.compra), fmtPesos(totales.flete), fmtPesos(totales.ganancia)];

    autoTable(doc, {
      head: [['Fecha', 'CPE', 'Cliente', 'Chofer', 'Carga', 'KG Desc.', 'Venta $', 'Compra $', 'Flete $', 'Ganancia $']],
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
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 9) {
          const text = String(data.cell.text);
          const num = parseFloat(text.replace(/[^0-9,-]/g, '').replace(',', '.'));
          if (!isNaN(num)) {
            data.cell.styles.textColor = num >= 0 ? [22, 163, 74] : [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    doc.save(`ganancias-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/contabilidad')} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Contabilidad
          </button>
          {!loading && filtered.length > 0 && (
            <button
              onClick={generarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Generar PDF
            </button>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Ganancias</h1>
        <p className="text-gray-600 mt-1">Ganancia por viaje = Venta − Compra − Flete</p>
      </div>

      {/* Filtros */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" /> Filtros
          </div>
          {hasFilters && (
            <button onClick={clearFiltros} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
            <select value={filtros.clienteId} onChange={(e) => setFiltro('clienteId', e.target.value)} className="input text-sm">
              <option value="">Todos</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha desde</label>
            <input type="date" value={filtros.fechaDesde} onChange={(e) => setFiltro('fechaDesde', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha hasta</label>
            <input type="date" value={filtros.fechaHasta} onChange={(e) => setFiltro('fechaHasta', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chofer</label>
            <select value={filtros.chofer} onChange={(e) => setFiltro('chofer', e.target.value)} className="input text-sm">
              <option value="">Todos</option>
              {uniqueChoferes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Carga</label>
            <select value={filtros.productoId} onChange={(e) => setFiltro('productoId', e.target.value)} className="input text-sm">
              <option value="">Todos</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Cards resumen */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Venta</p>
            <p className="text-xl font-bold text-gray-900">{fmtPesos(totales.venta)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Compra</p>
            <p className="text-xl font-bold text-gray-900">{fmtPesos(totales.compra)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Flete</p>
            <p className="text-xl font-bold text-gray-900">{fmtPesos(totales.flete)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Ganancia Neta</p>
            <p className={`text-xl font-bold ${totales.ganancia >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmtPesos(totales.ganancia)}
            </p>
          </div>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">No hay viajes para los filtros seleccionados</div>
      ) : (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">CPE</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Chofer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Carga</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">KG Desc.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Venta $</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Compra $</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Flete $</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Ganancia $</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => {
                const kg = (v.kgDescargados || v.kgCargados || 0) / 1000;
                const venta  = kg * (v.precioVenta || 0);
                const compra = kg * (v.precioCompra || 0);
                const flete  = kg * (v.tarifaTransporte || 0);
                const ganancia = venta - compra - flete;
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(v.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.cpe || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{getNombre(clientes, v.clienteId)}</td>
                    <td className="px-4 py-3 text-gray-700">{getChofer(v.chofer)}</td>
                    <td className="px-4 py-3 text-gray-700">{getProducto(v.productoId)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(v.kgDescargados || v.kgCargados)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtPesos(venta)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtPesos(compra)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtPesos(flete)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${ganancia >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {fmtPesos(ganancia)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right font-semibold text-gray-700">TOTAL:</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtPesos(totales.venta)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtPesos(totales.compra)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtPesos(totales.flete)}</td>
                <td className={`px-4 py-3 text-right font-bold text-lg ${totales.ganancia >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {fmtPesos(totales.ganancia)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
