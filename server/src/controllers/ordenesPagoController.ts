// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getOrdenesPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const ordenes = await prisma.ordenPago.findMany({
      include: {
        fletero: { select: { id: true, nombre: true } },
        viajes: { select: { id: true, fecha: true, origen: true, destino: true, totalViaje: true, fcNro: true } },
        valores: true, comprobantes: true,
      },
      orderBy: { fecha: 'desc' },
    });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes de pago' });
  }
};

export const createOrdenPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fleteroId, viajesIds, total, valores, comprobantes } = req.body;
    if (!fleteroId) { res.status(400).json({ error: 'El fletero es requerido' }); return; }
    const orden = await prisma.ordenPago.create({
      data: {
        fleteroId, total: parseFloat(total || 0),
        viajes: viajesIds?.length ? { connect: viajesIds.map((id: string) => ({ id })) } : undefined,
        valores: valores?.length ? { create: valores.map((v: any) => ({ tipo: v.tipo, monto: parseFloat(v.monto), chequeBanco: v.chequeBanco, chequeNro: v.chequeNro, chequeFecha: v.chequeFecha ? new Date(v.chequeFecha) : null })) } : undefined,
        comprobantes: comprobantes?.length ? { create: comprobantes.map((c: any) => ({ tipo: c.tipo, numero: c.numero, monto: parseFloat(c.monto), fecha: c.fecha ? new Date(c.fecha) : null })) } : undefined,
      },
      include: { fletero: { select: { id: true, nombre: true } }, viajes: true, valores: true, comprobantes: true },
    });
    if (viajesIds?.length) {
      await prisma.viaje.updateMany({ where: { id: { in: viajesIds } }, data: { estadoPago: 'PAGADO', ordenPagoId: orden.id } });
    }
    res.status(201).json(orden);
  } catch (error) {
    console.error('Error al crear orden de pago:', error);
    res.status(500).json({ error: 'Error al crear orden de pago' });
  }
};

export const updateOrdenPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const orden = await prisma.ordenPago.update({
      where: { id }, data: { estado },
      include: { fletero: { select: { id: true, nombre: true } }, viajes: true, valores: true, comprobantes: true },
    });
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar orden de pago' });
  }
};
