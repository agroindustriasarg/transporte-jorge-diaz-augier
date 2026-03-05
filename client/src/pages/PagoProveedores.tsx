// @ts-nocheck
import { useEffect, useState } from 'react';
import PagosModulo from '../components/PagosModulo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export default function PagoProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/proveedores`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProveedores(data.filter((p: any) => p.activo).map((p: any) => ({ id: p.id, nombre: p.nombre }))); });
  }, []);

  return <PagosModulo tipo="proveedor" titulo="Pago Proveedores" entidades={proveedores} entidadLabel="Proveedor" />;
}
