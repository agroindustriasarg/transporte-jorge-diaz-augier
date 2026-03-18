export type RolUsuario = 'ADMIN' | 'CONTADOR' | 'OPERARIO' | 'VISOR';

export interface Usuario {
  id: string;
  usuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activo: boolean;
  createdAt: string;
}

export interface Ruta {
  id: string;
  clienteId: string;
  cliente?: { id: string; nombre: string };
  origen: string;
  destino: string;
  tipoCarga?: string;
  tarifaSinIVA: number;
  comision: number;
  activo: boolean;
}

export interface Comisionista {
  id: string;
  nombre: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE';

export interface Fletero {
  id: string;
  nombre: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  formaPago: FormaPago;
  plazo: number;
  comisionistaId?: string;
  comisionista?: { id: string; nombre: string };
  activo: boolean;
}

export type EstadoViaje = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';
export type EstadoPago = 'PENDIENTE' | 'PAGADO';
export type TipoIVA = 'IVA_21' | 'IVA_10_5' | 'EXENTO';

export interface Viaje {
  id: string;
  fecha: string;
  clienteId: string;
  cliente?: { id: string; nombre: string };
  rutaId?: string;
  ruta?: { id: string; origen: string; destino: string };
  origen: string;
  destino: string;
  tipoCarga?: string;
  cantCarga?: number;
  tarifaSinIVA?: number;
  tipoIVA: TipoIVA;
  valorIVA?: number;
  valorViaje?: number;
  totalViaje?: number;
  comision?: number;
  comisionistaId?: string;
  comisionista?: { id: string; nombre: string };
  fleteroId?: string;
  fletero?: { id: string; nombre: string; plazo: number };
  remito?: string;
  fcNro?: string;
  fechaRecepcion?: string;
  estadoViaje: EstadoViaje;
  estadoPago: EstadoPago;
  ordenPagoId?: string;
  observaciones?: string;
  createdAt: string;
}

export interface ValorOP {
  id: string;
  tipo: string;
  monto: number;
  chequeBanco?: string;
  chequeNro?: string;
  chequeFecha?: string;
}

export interface ComprobanteOP {
  id: string;
  tipo: string;
  numero: string;
  monto: number;
  fecha?: string;
}

export interface OrdenPago {
  id: string;
  numero: number;
  fecha: string;
  fleteroId: string;
  fletero?: { id: string; nombre: string };
  total: number;
  estado: string;
  viajes?: Viaje[];
  valores?: ValorOP[];
  comprobantes?: ComprobanteOP[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  usuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
}
