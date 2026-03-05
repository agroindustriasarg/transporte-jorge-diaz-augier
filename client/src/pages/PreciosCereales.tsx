// @ts-nocheck
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Pencil, X, Check, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const CEREALES_CONFIG = {
  TRIGO:   { color: 'bg-amber-700',  bar: 'bg-amber-700',  emoji: '🌾' },
  'MAÍZ':  { color: 'bg-orange-500', bar: 'bg-orange-500', emoji: '🌽' },
  GIRASOL: { color: 'bg-yellow-400', bar: 'bg-yellow-400', emoji: '🌻' },
  SOJA:    { color: 'bg-green-600',  bar: 'bg-green-600',  emoji: '🫘' },
  SORGO:   { color: 'bg-red-600',    bar: 'bg-red-600',    emoji: '🌿' },
};

const ORDEN = ['TRIGO', 'MAÍZ', 'GIRASOL', 'SOJA', 'SORGO'];

function formatPesos(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}

function formatNum(n: number) {
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 3 }).format(n);
}

type Precio = {
  id: string;
  cereal: string;
  precio: number;
  difPesos: number;
  difPct: number;
  tendencia: string;
  updatedAt: string;
};

type EditForm = {
  precio: string;
  difPesos: string;
  difPct: string;
  tendencia: string;
};

export default function PreciosCereales() {
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCereal, setEditingCereal] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ precio: '', difPesos: '', difPct: '', tendencia: 'up' });
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');

  const token = localStorage.getItem('token');

  const fetchPrecios = async () => {
    try {
      const res = await fetch(`${API_URL}/precios-cereales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Ordenar según ORDEN definido
      const ordered = ORDEN.map((c) => data.find((p: Precio) => p.cereal === c)).filter(Boolean);
      setPrecios(ordered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrecios(); }, []);

  const handleScrape = async () => {
    setScraping(true);
    setScrapeMsg('');
    try {
      const res = await fetch(`${API_URL}/precios-cereales/scrape`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      await fetchPrecios();
      setScrapeMsg(`✅ ${data.actualizados} cereales actualizados desde BCR`);
    } catch (e: any) {
      setScrapeMsg(`❌ ${e.message}`);
    } finally {
      setScraping(false);
      setTimeout(() => setScrapeMsg(''), 5000);
    }
  };

  const handleEdit = (p: Precio) => {
    setEditingCereal(p.cereal);
    setForm({
      precio: p.precio ? String(p.precio) : '',
      difPesos: p.difPesos ? String(p.difPesos) : '',
      difPct: p.difPct ? String(p.difPct) : '',
      tendencia: p.tendencia || 'up',
    });
  };

  const handleSave = async (cereal: string) => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/precios-cereales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cereal, ...form }),
      });
      await fetchPrecios();
      setEditingCereal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) return <div className="text-gray-500">Cargando precios...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Precios Cereales</h1>
        <p className="text-gray-500 mt-1 text-lg font-medium">Precios Pizarra del día {today}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleScrape} disabled={scraping}
          className="btn-primary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
          {scraping ? 'Actualizando desde BCR...' : 'Actualizar desde BCR'}
        </button>
        {scrapeMsg && <span className="text-sm text-gray-600">{scrapeMsg}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ORDEN.map((cereal) => {
          const p = precios.find((x) => x.cereal === cereal);
          const cfg = CEREALES_CONFIG[cereal] || { color: 'bg-gray-500', bar: 'bg-gray-500', emoji: '🌾' };
          const isEditing = editingCereal === cereal;
          const precio = p?.precio ?? 0;
          const difPesos = p?.difPesos ?? 0;
          const difPct = p?.difPct ?? 0;
          const tendencia = p?.tendencia ?? 'up';

          return (
            <div key={cereal} className="card p-0 overflow-hidden relative">
              {/* Barra de color superior */}
              <div className={`h-1.5 ${cfg.bar}`} />

              <div className="p-4">
                {/* Ícono + nombre + botón editar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`${cfg.color} w-9 h-9 rounded-full flex items-center justify-center text-lg`}>
                      {cfg.emoji}
                    </div>
                    <span className="font-bold text-gray-700 text-sm tracking-wide">{cereal}</span>
                  </div>
                  {!isEditing && (
                    <button onClick={() => handleEdit(p || { id: cereal, cereal, precio: 0, difPesos: 0, difPct: 0, tendencia: 'up', updatedAt: '' })}
                      className="text-gray-400 hover:text-primary-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500">Precio $/tn</label>
                      <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
                        className="input py-1 text-sm w-full" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Dif. $/tn</label>
                      <input type="number" value={form.difPesos} onChange={(e) => setForm({ ...form, difPesos: e.target.value })}
                        className="input py-1 text-sm w-full" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Dif. %</label>
                      <input type="number" value={form.difPct} onChange={(e) => setForm({ ...form, difPct: e.target.value })}
                        className="input py-1 text-sm w-full" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Tendencia</label>
                      <select value={form.tendencia} onChange={(e) => setForm({ ...form, tendencia: e.target.value })}
                        className="input py-1 text-sm w-full">
                        <option value="up">↑ Sube</option>
                        <option value="down">↓ Baja</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleSave(cereal)} disabled={saving}
                        className="btn-primary py-1 px-3 text-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> Guardar
                      </button>
                      <button onClick={() => setEditingCereal(null)}
                        className="btn-secondary py-1 px-3 text-sm flex items-center gap-1">
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Precio principal */}
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      {formatPesos(precio)}
                    </div>

                    {/* Dif y tendencia */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>DIF. $/tn</span>
                        <span className="font-medium text-gray-700">{formatNum(difPesos)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>DIF. %</span>
                        <span className="font-medium text-gray-700">{formatNum(difPct)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 items-center">
                        <span>TEND.</span>
                        {tendencia === 'up'
                          ? <TrendingUp className="w-5 h-5 text-green-500" />
                          : <TrendingDown className="w-5 h-5 text-red-500" />}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
