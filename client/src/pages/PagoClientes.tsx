// @ts-nocheck
import { useEffect, useState } from 'react';
import PagosModulo from '../components/PagosModulo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export default function PagoClientes() {
  const [clientes, setClientes] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClientes(data.filter((c: any) => c.activo).map((c: any) => ({ id: c.id, nombre: c.nombre }))); });
  }, []);

  return <PagosModulo tipo="cliente" titulo="Cobranza Clientes" entidades={clientes} entidadLabel="Cliente" />;
}
