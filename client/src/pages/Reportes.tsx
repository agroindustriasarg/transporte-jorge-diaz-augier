// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { Users, Building2, Truck, Filter, X, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

type Tab = 'clientes' | 'proveedores' | 'transporte';

type Viaje = {
  id: string;
  fecha: string;
  chofer: string | null;
  patente: string | null;
  productoId: string | null;
  clienteId: string | null;
  proveedorId: string | null;
  kgCargados: number | null;
  kgDescargados: number | null;
  tarifaCliente: number | null;
  tarifaTransporte: number | null;
  precioCompra: number | null;
  precioVenta: number | null;
  transporte: string | null;
  kmRecorridos: number | null;
  cpe: string | null;
  descuento: number | null;
  precioPizarra: number | null;
};

type Entidad = { id: string; nombre: string };
type Producto = { id: string; nombre: string };
type Chofer = { id: string; nombre: string; apellido: string; transporte?: string | null };
type Pago = { id: string; entidadId: string; monto: number; montoARS?: number; fecha: string };
type SaldoViaje = { estado: 'pagado' | 'parcial' | 'pendiente'; pagado: number; pendiente: number; totalViaje: number };

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(n);
}

function fmtPesos(n: number | null | undefined) {
  if (n == null || n === 0) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}

// Calcula saldo por viaje usando FIFO (viajes más viejos primero)
function calcularSaldosFIFO(
  viajes: Viaje[],
  pagos: Pago[],
  getEntityId: (v: Viaje) => string | null,
  getTarifa: (v: Viaje) => number,
  getMonto: (p: Pago) => number = (p) => Number(p.monto),
): { saldosMap: Map<string, SaldoViaje>; aFavorPorEntidad: Map<string, number> } {
  const pagosPorEntidad = new Map<string, number>();
  for (const p of pagos) {
    pagosPorEntidad.set(p.entidadId, (pagosPorEntidad.get(p.entidadId) || 0) + getMonto(p));
  }

  const saldosMap = new Map<string, SaldoViaje>();
  const aFavorPorEntidad = new Map<string, number>();
  const entityIds = [...new Set(viajes.map(getEntityId).filter(Boolean))] as string[];

  for (const entityId of entityIds) {
    const viajesEntidad = viajes
      .filter((v) => getEntityId(v) === entityId)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    let saldoRestante = pagosPorEntidad.get(entityId) || 0;

    for (const viaje of viajesEntidad) {
      const totalViaje = getTarifa(viaje);
      if (totalViaje === 0) {
        saldosMap.set(viaje.id, { estado: 'pagado', pagado: 0, pendiente: 0, totalViaje: 0 });
      } else if (saldoRestante >= totalViaje) {
        saldosMap.set(viaje.id, { estado: 'pagado', pagado: totalViaje, pendiente: 0, totalViaje });
        saldoRestante -= totalViaje;
      } else if (saldoRestante > 0) {
        saldosMap.set(viaje.id, { estado: 'parcial', pagado: saldoRestante, pendiente: totalViaje - saldoRestante, totalViaje });
        saldoRestante = 0;
      } else {
        saldosMap.set(viaje.id, { estado: 'pendiente', pagado: 0, pendiente: totalViaje, totalViaje });
      }
    }
    if (saldoRestante > 0) aFavorPorEntidad.set(entityId, saldoRestante);
  }

  return { saldosMap, aFavorPorEntidad };
}

function SaldoBadge({ s }: { s: SaldoViaje | undefined }) {
  if (!s || s.totalViaje === 0) return <span className="text-gray-400 text-xs">—</span>;
  if (s.estado === 'pagado')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Pagado</span>;
  if (s.estado === 'parcial')
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Parcial</span>
        <span className="text-xs text-red-600 font-medium">Debe {fmtPesos(s.pendiente)}</span>
      </span>
    );
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Pendiente {fmtPesos(s.pendiente)}</span>;
}

const emptyFiltros = {
  clientes:    { clienteId: '', fechaDesde: '', fechaHasta: '', chofer: '', productoId: '', estadoPago: '' },
  proveedores: { proveedorId: '', fechaDesde: '', fechaHasta: '', chofer: '', productoId: '', estadoPago: '' },
  transporte:  { chofer: '', transporteEmpresa: '', fechaDesde: '', fechaHasta: '', productoId: '', estadoPago: '' },
};

export default function Reportes() {
  const [tab, setTab] = useState<Tab>('clientes');
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [clientes, setClientes] = useState<Entidad[]>([]);
  const [proveedores, setProveedores] = useState<Entidad[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [pagosClientes, setPagosClientes] = useState<Pago[]>([]);
  const [pagosProveedores, setPagosProveedores] = useState<Pago[]>([]);
  const [pagosTransporte, setPagosTransporte] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ ...emptyFiltros });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vRes, cRes, pRes, prodRes, chRes, pagCRes, pagPRes, pagTRes] = await Promise.all([
          fetch(`${API_URL}/viajes`, { headers }),
          fetch(`${API_URL}/clientes`, { headers }),
          fetch(`${API_URL}/proveedores`, { headers }),
          fetch(`${API_URL}/productos`, { headers }),
          fetch(`${API_URL}/choferes`, { headers }),
          fetch(`${API_URL}/pagos?tipo=cliente`, { headers }),
          fetch(`${API_URL}/pagos?tipo=proveedor`, { headers }),
          fetch(`${API_URL}/pagos?tipo=transporte`, { headers }),
        ]);
        setViajes(await vRes.json());
        setClientes(await cRes.json());
        setProveedores(await pRes.json());
        setProductos(await prodRes.json());
        setChoferes(await chRes.json());
        const pc = await pagCRes.json(); setPagosClientes(Array.isArray(pc) ? pc : []);
        const pp = await pagPRes.json(); setPagosProveedores(Array.isArray(pp) ? pp : []);
        const pt = await pagTRes.json(); setPagosTransporte(Array.isArray(pt) ? pt : []);
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
    return c ? `${c.nombre} ${c.apellido}` : id;
  };

  const uniqueChoferes = useMemo(() => {
    const ids = [...new Set(viajes.map((v) => v.chofer).filter(Boolean))] as string[];
    return ids
      .map((id) => {
        const c = choferes.find((ch) => ch.id === id);
        return { id, label: c ? `${c.nombre} ${c.apellido}` : id };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [viajes, choferes]);

  const uniqueEmpresas = useMemo(() => {
    const empresas = [...new Set(choferes.map((c) => c.transporte).filter(Boolean))] as string[];
    return empresas.sort((a, b) => a.localeCompare(b));
  }, [choferes]);

  // FIFO para los 3 tipos
  const { saldosMapCli, aFavorCli, saldosMapProv, aFavorProv, saldosMapTrans, aFavorTrans, choferToEmpresa } = useMemo(() => {
    const kg = (v: Viaje) => (v.kgDescargados || v.kgCargados || 0) / 1000;

    // Para transporte: agrupar por empresa (c.transporte), no por chofer individual.
    const choferToEmpresa = new Map<string, string>();
    for (const c of choferes) {
      choferToEmpresa.set(c.id, c.transporte || c.id);
    }
    const pagosTransNorm = pagosTransporte.map((p) => ({
      ...p,
      entidadId: choferToEmpresa.get(p.entidadId) || p.entidadId,
    }));

    const cli   = calcularSaldosFIFO(viajes, pagosClientes,   (v) => v.clienteId,  (v) => kg(v) * (v.precioVenta || 0));
    const prov  = calcularSaldosFIFO(viajes, pagosProveedores, (v) => v.proveedorId, (v) => kg(v) * (v.precioCompra || 0));
    const trans = calcularSaldosFIFO(
      viajes, pagosTransNorm,
      (v) => v.chofer ? (choferToEmpresa.get(v.chofer) || v.chofer) : null,
      (v) => kg(v) * (v.tarifaTransporte || 0),
      (p) => Number(p.montoARS ?? p.monto),
    );
    return {
      saldosMapCli:   cli.saldosMap,   aFavorCli:   cli.aFavorPorEntidad,
      saldosMapProv:  prov.saldosMap,  aFavorProv:  prov.aFavorPorEntidad,
      saldosMapTrans: trans.saldosMap, aFavorTrans: trans.aFavorPorEntidad,
      choferToEmpresa,
    };
  }, [viajes, pagosClientes, pagosProveedores, pagosTransporte, choferes]);

  const f = filtros[tab] as any;

  const filtered = useMemo(() => {
    const sMap = tab === 'clientes' ? saldosMapCli : tab === 'proveedores' ? saldosMapProv : saldosMapTrans;
    return viajes.filter((v) => {
      const fecha = new Date(v.fecha);
      if (f.fechaDesde && fecha < new Date(f.fechaDesde)) return false;
      if (f.fechaHasta) {
        const hasta = new Date(f.fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        if (fecha > hasta) return false;
      }
      if (f.productoId && v.productoId !== f.productoId) return false;
      if (f.chofer && v.chofer !== f.chofer) return false;
      if (tab === 'clientes' && f.clienteId && v.clienteId !== f.clienteId) return false;
      if (tab === 'proveedores' && f.proveedorId && v.proveedorId !== f.proveedorId) return false;
      if (tab === 'transporte' && f.transporteEmpresa) {
        const empresa = v.chofer ? (choferToEmpresa.get(v.chofer) || '') : '';
        if (empresa !== f.transporteEmpresa) return false;
      }
      if (f.estadoPago) {
        const s = sMap.get(v.id);
        const estado = s ? s.estado : 'pendiente';
        if (f.estadoPago === 'pagado' && estado !== 'pagado') return false;
        if (f.estadoPago === 'debe' && estado === 'pagado') return false;
      }
      return true;
    });
  }, [viajes, filtros, tab, saldosMapCli, saldosMapProv, saldosMapTrans]);

  const setFiltro = (key: string, value: string) => {
    setFiltros((prev) => ({ ...prev, [tab]: { ...prev[tab as Tab], [key]: value } }));
  };

  const clearFiltros = () => {
    setFiltros((prev) => ({ ...prev, [tab]: { ...emptyFiltros[tab] } }));
  };

  const hasFilters = Object.values(f).some((v) => v !== '');

  // Totales de kg y $ de los viajes filtrados
  const totales = useMemo(() => {
    const kgCarg = filtered.reduce((a, v) => a + (v.kgCargados || 0), 0);
    const kgDesc = filtered.reduce((a, v) => a + (v.kgDescargados || 0), 0);
    const totalCliente   = filtered.reduce((a, v) => a + ((v.kgDescargados || v.kgCargados || 0) / 1000) * (v.precioVenta || 0), 0);
    const totalTransporte = filtered.reduce((a, v) => a + ((v.kgDescargados || v.kgCargados || 0) / 1000) * (v.tarifaTransporte || 0), 0);
    const totalCompra    = filtered.reduce((a, v) => a + ((v.kgDescargados || v.kgCargados || 0) / 1000) * (v.precioCompra || 0), 0);
    return { kgCarg, kgDesc, totalCliente, totalTransporte, totalCompra };
  }, [filtered]);

  // Resumen cobrado/pagado vs pendiente/aFavor — solo de los viajes filtrados
  const resumen = useMemo(() => {
    const sMap   = tab === 'clientes' ? saldosMapCli : tab === 'proveedores' ? saldosMapProv : saldosMapTrans;
    const aFavor = tab === 'clientes' ? aFavorCli    : tab === 'proveedores' ? aFavorProv    : aFavorTrans;
    const getTarifa = (v: Viaje) => {
      const kg = (v.kgDescargados || v.kgCargados || 0) / 1000;
      return tab === 'clientes' ? kg * (v.precioVenta || 0) : tab === 'proveedores' ? kg * (v.precioCompra || 0) : kg * (v.tarifaTransporte || 0);
    };
    // Para transporte las claves de aFavor son nombres de empresa, no UUIDs de chofer
    const getEntityKey = (v: Viaje): string | null => {
      if (tab === 'clientes') return v.clienteId;
      if (tab === 'proveedores') return v.proveedorId;
      return v.chofer ? (choferToEmpresa.get(v.chofer) || v.chofer) : null;
    };

    let cobrado = 0, pendiente = 0;
    for (const v of filtered) {
      const s = sMap.get(v.id);
      if (s) { cobrado += s.pagado; pendiente += s.pendiente; }
      else { pendiente += getTarifa(v); }
    }

    // Saldo a favor: suma del exceso pagado por entidades presentes en los viajes filtrados
    const entityIds = [...new Set(filtered.map(getEntityKey).filter(Boolean))] as string[];
    let saldoAFavor = 0;
    for (const id of entityIds) saldoAFavor += aFavor.get(id) || 0;

    return { cobrado, pendiente, saldoAFavor };
  }, [tab, filtered, saldosMapCli, saldosMapProv, saldosMapTrans, aFavorCli, aFavorProv, aFavorTrans, choferToEmpresa]);

  const tabs: { id: Tab; label: string; icon: any; activeColor: string }[] = [
    { id: 'clientes',    label: 'Clientes',    icon: Users,     activeColor: 'border-green-500 text-green-700' },
    { id: 'proveedores', label: 'Proveedores', icon: Building2, activeColor: 'border-blue-500 text-blue-700' },
    { id: 'transporte',  label: 'Transporte',  icon: Truck,     activeColor: 'border-orange-500 text-orange-700' },
  ];

  const mainTotal = tab === 'clientes' ? totales.totalCliente : tab === 'transporte' ? totales.totalTransporte : totales.totalCompra;
  const currentSaldosMap = tab === 'clientes' ? saldosMapCli : tab === 'proveedores' ? saldosMapProv : saldosMapTrans;

  const labelFacturado  = tab === 'clientes' ? 'Total Facturado' : tab === 'proveedores' ? 'Total Compra' : 'Total Flete';
  const labelCobrado    = tab === 'clientes' ? 'Total Cobrado'   : 'Total Pagado';
  const labelPendiente  = tab === 'clientes' ? 'Saldo Pendiente' : 'Saldo a Pagar';

  const fmtPDF = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    const tabLabel = tab === 'clientes' ? 'Clientes' : tab === 'proveedores' ? 'Proveedores' : 'Transporte';
    const fecha = new Date().toLocaleDateString('es-AR');

    // Título
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(`Reporte de ${tabLabel}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${fecha}  |  ${filtered.length} viaje${filtered.length !== 1 ? 's' : ''}`, 14, 26);

    // Resumen en línea
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const resumenTexto = [
      `${labelFacturado}: ${fmtPDF(mainTotal)}`,
      `${labelCobrado}: ${fmtPDF(resumen.cobrado)}`,
      resumen.pendiente > 0
        ? `${labelPendiente}: ${fmtPDF(resumen.pendiente)}`
        : resumen.saldoAFavor > 0
          ? `Saldo a Favor: ${fmtPDF(resumen.saldoAFavor)}`
          : 'Al día',
    ].join('    ');
    doc.text(resumenTexto, 14, 33);

    // Columnas según tab
    const columns =
      tab === 'clientes'
        ? ['Fecha', 'CPE', 'Cliente', 'Chofer', 'Carga', 'KG Desc.', 'P.Venta $/tn', 'Total $', 'Saldo']
        : tab === 'proveedores'
        ? ['Fecha', 'CPE', 'Proveedor', 'Chofer', 'Carga', 'KG Desc.', 'P.Compra $/tn', 'Total Compra', 'Saldo']
        : ['Fecha', 'CPE', 'Cliente', 'Chofer', 'Carga', 'KG Desc.', 'Flete $/tn', 'Total Flete', 'Saldo'];

    const getSaldoText = (s: SaldoViaje | undefined) => {
      if (!s || s.totalViaje === 0) return '—';
      if (s.estado === 'pagado') return 'Pagado';
      if (s.estado === 'parcial') return `Parcial - Debe ${fmtPDF(s.pendiente)}`;
      return `Pendiente ${fmtPDF(s.pendiente)}`;
    };

    const rows = filtered.map((v) => {
      const tn = (v.kgDescargados || v.kgCargados || 0) / 1000;
      const saldo = currentSaldosMap.get(v.id);
      const fecha = new Date(v.fecha).toLocaleDateString('es-AR');
      const kgDesc = fmt(v.kgDescargados || v.kgCargados);
      const chofer = getChofer(v.chofer);
      const carga = getProducto(v.productoId);

      if (tab === 'clientes') {
        return [fecha, v.cpe || '—', getNombre(clientes, v.clienteId), chofer, carga, kgDesc,
          fmtPDF(v.precioVenta || 0), fmtPDF(tn * (v.precioVenta || 0)), getSaldoText(saldo)];
      } else if (tab === 'proveedores') {
        return [fecha, v.cpe || '—', getNombre(proveedores, v.proveedorId), chofer, carga, kgDesc,
          fmtPDF(v.precioCompra || 0), fmtPDF(tn * (v.precioCompra || 0)), getSaldoText(saldo)];
      } else {
        return [fecha, v.cpe || '—', getNombre(clientes, v.clienteId), chofer, carga, kgDesc,
          fmtPDF(v.tarifaTransporte || 0), fmtPDF(tn * (v.tarifaTransporte || 0)), getSaldoText(saldo)];
      }
    });

    // Fila de totales
    const footerRow = ['', '', '', '', 'TOTAL', fmt(totales.kgDesc), '', fmtPDF(mainTotal), ''];

    autoTable(doc, {
      head: [columns],
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
        8: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 8) {
          const text = String(data.cell.text);
          if (text.startsWith('Pagado')) data.cell.styles.textColor = [22, 163, 74];
          else if (text.startsWith('Pendiente') || text.startsWith('Parcial')) data.cell.styles.textColor = [220, 38, 38];
        }
      },
    });

    doc.save(`reporte-${tab}-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Análisis filtrado de viajes</p>
        </div>
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

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active ? t.activeColor : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            Filtros
          </div>
          {hasFilters && (
            <button onClick={clearFiltros} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Entidad */}
          {tab === 'clientes' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
              <select value={f.clienteId} onChange={(e) => setFiltro('clienteId', e.target.value)} className="input text-sm">
                <option value="">Todos</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}
          {tab === 'proveedores' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
              <select value={f.proveedorId} onChange={(e) => setFiltro('proveedorId', e.target.value)} className="input text-sm">
                <option value="">Todos</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          )}
          {tab === 'transporte' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Transporte</label>
              <select value={f.transporteEmpresa} onChange={(e) => setFiltro('transporteEmpresa', e.target.value)} className="input text-sm">
                <option value="">Todos</option>
                {uniqueEmpresas.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}
          {tab === 'transporte' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chofer</label>
              <select value={f.chofer} onChange={(e) => setFiltro('chofer', e.target.value)} className="input text-sm">
                <option value="">Todos</option>
                {uniqueChoferes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha desde</label>
            <input type="date" value={f.fechaDesde} onChange={(e) => setFiltro('fechaDesde', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha hasta</label>
            <input type="date" value={f.fechaHasta} onChange={(e) => setFiltro('fechaHasta', e.target.value)} className="input text-sm" />
          </div>

          {/* Chofer (solo en tabs que no son transporte) */}
          {tab !== 'transporte' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chofer</label>
              <select value={f.chofer} onChange={(e) => setFiltro('chofer', e.target.value)} className="input text-sm">
                <option value="">Todos</option>
                {uniqueChoferes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          )}

          {/* Carga */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Carga</label>
            <select value={f.productoId} onChange={(e) => setFiltro('productoId', e.target.value)} className="input text-sm">
              <option value="">Todos</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {/* Estado pago */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select value={f.estadoPago} onChange={(e) => setFiltro('estadoPago', e.target.value)} className="input text-sm">
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="debe">Debe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary cards — 4 columnas para todos los tabs */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Viajes</p>
            <p className="text-3xl font-bold text-gray-900">{filtered.length}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{labelFacturado}</p>
            <p className="text-xl font-bold text-gray-900">{fmtPesos(mainTotal)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{labelCobrado}</p>
            <p className="text-xl font-bold text-green-600">{resumen.cobrado > 0 ? fmtPesos(resumen.cobrado) : '$ 0,00'}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {resumen.saldoAFavor > 0 && resumen.pendiente === 0 ? 'Saldo a Favor' : labelPendiente}
            </p>
            <p className={`text-xl font-bold ${
              resumen.saldoAFavor > 0 && resumen.pendiente === 0
                ? 'text-blue-600'
                : resumen.pendiente > 0
                  ? 'text-red-600'
                  : 'text-green-600'
            }`}>
              {resumen.saldoAFavor > 0 && resumen.pendiente === 0
                ? fmtPesos(resumen.saldoAFavor)
                : resumen.pendiente > 0
                  ? fmtPesos(resumen.pendiente)
                  : '✓ Al día'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          No hay viajes para los filtros seleccionados
        </div>
      ) : (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">CPE</th>
                {tab === 'clientes'    && <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cliente</th>}
                {tab === 'proveedores' && <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Proveedor</th>}
                {tab === 'transporte'  && <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cliente</th>}
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Chofer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Carga</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">KG Carg.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">KG Desc.</th>
                {tab === 'clientes' && <>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">P. Venta $/tn</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Total $</th>
                </>}
                {tab === 'proveedores' && <>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">P. Compra $/tn</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Total Compra</th>
                </>}
                {tab === 'transporte' && <>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Flete $/tn</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Total Flete</th>
                </>}
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Saldo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => {
                const kg = v.kgDescargados || v.kgCargados || 0;
                const tn = kg / 1000;
                const totalCli   = tn * (v.precioVenta || 0);
                const totalTrans = tn * (v.tarifaTransporte || 0);
                const totalComp  = tn * (v.precioCompra || 0);
                const saldo = currentSaldosMap.get(v.id);

                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(v.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.cpe || '—'}</td>
                    {tab === 'clientes'    && <td className="px-4 py-3 text-gray-700">{getNombre(clientes, v.clienteId)}</td>}
                    {tab === 'proveedores' && <td className="px-4 py-3 text-gray-700">{getNombre(proveedores, v.proveedorId)}</td>}
                    {tab === 'transporte'  && <td className="px-4 py-3 text-gray-500">{getNombre(clientes, v.clienteId)}</td>}
                    <td className="px-4 py-3 text-gray-700">{getChofer(v.chofer)}</td>
                    <td className="px-4 py-3 text-gray-700">{getProducto(v.productoId)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(v.kgCargados)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(v.kgDescargados)}</td>
                    {tab === 'clientes' && <>
                      <td className="px-4 py-3 text-right text-gray-700">{fmtPesos(v.precioVenta)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtPesos(totalCli)}</td>
                    </>}
                    {tab === 'proveedores' && <>
                      <td className="px-4 py-3 text-right text-gray-700">{fmtPesos(v.precioCompra)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtPesos(totalComp)}</td>
                    </>}
                    {tab === 'transporte' && <>
                      <td className="px-4 py-3 text-right text-gray-700">{fmtPesos(v.tarifaTransporte)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtPesos(totalTrans)}</td>
                    </>}
                    <td className="px-4 py-3"><SaldoBadge s={saldo} /></td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-700">TOTAL:</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(totales.kgCarg)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(totales.kgDesc)}</td>
                <td></td>
                <td className="px-4 py-3 text-right font-bold text-green-700">{fmtPesos(mainTotal)}</td>
                <td className="px-4 py-3">
                  {resumen.pendiente > 0 && (
                    <span className="text-xs font-semibold text-red-600">
                      {tab === 'clientes' ? 'Por cobrar' : 'Por pagar'} {fmtPesos(resumen.pendiente)}
                    </span>
                  )}
                  {resumen.pendiente === 0 && resumen.cobrado > 0 && (
                    <span className="text-xs font-semibold text-green-600">✓ Todo al día</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
