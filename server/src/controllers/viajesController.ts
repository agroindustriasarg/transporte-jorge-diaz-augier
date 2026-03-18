// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

const viajeInclude = {
  cliente: { select: { id: true, nombre: true } },
  ruta: { select: { id: true, origen: true, destino: true } },
  fletero: { select: { id: true, nombre: true, plazo: true } },
  comisionista: { select: { id: true, nombre: true } },
};

export const getViajes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estadoViaje, estadoPago, clienteId } = req.query;
    const viajes = await prisma.viaje.findMany({
      where: {
        ...(estadoViaje ? { estadoViaje: estadoViaje as any } : {}),
        ...(estadoPago ? { estadoPago: estadoPago as any } : {}),
        ...(clienteId ? { clienteId: clienteId as string } : {}),
      },
      include: viajeInclude,
      orderBy: { fecha: 'desc' },
    });
    res.json(viajes);
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
};

export const getViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const viaje = await prisma.viaje.findUnique({ where: { id }, include: viajeInclude });
    if (!viaje) { res.status(404).json({ error: 'Viaje no encontrado' }); return; }
    res.json(viaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener viaje' });
  }
};

const parseF = (v: any) => (v !== undefined && v !== '' ? parseFloat(v) : null);

export const createViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, clienteId, rutaId, origen, destino, tipoCarga, cantCarga, tarifaSinIVA, tipoIVA, valorIVA, valorViaje, totalViaje, comision, comisionistaId, fleteroId, remito, fcNro, fechaRecepcion, estadoViaje, estadoPago, observaciones } = req.body;
    if (!clienteId || !origen || !destino) { res.status(400).json({ error: 'Cliente, origen y destino son requeridos' }); return; }
    const viaje = await prisma.viaje.create({
      data: {
        fecha: new Date(fecha),
        clienteId, rutaId: rutaId || null, origen, destino, tipoCarga,
        cantCarga: parseF(cantCarga), tarifaSinIVA: parseF(tarifaSinIVA),
        tipoIVA: tipoIVA || 'EXENTO',
        valorIVA: valorIVA !== undefined ? parseFloat(valorIVA) : 0,
        valorViaje: parseF(valorViaje), totalViaje: parseF(totalViaje),
        comision: comision !== undefined && comision !== '' ? parseFloat(comision) : 0,
        comisionistaId: comisionistaId || null, fleteroId: fleteroId || null,
        remito, fcNro, fechaRecepcion: fechaRecepcion ? new Date(fechaRecepcion) : null,
        estadoViaje: estadoViaje || 'PENDIENTE', estadoPago: estadoPago || 'PENDIENTE', observaciones,
      },
      include: viajeInclude,
    });
    res.status(201).json(viaje);
  } catch (error) {
    console.error('Error al crear viaje:', error);
    res.status(500).json({ error: 'Error al crear viaje' });
  }
};

export const updateViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fecha, clienteId, rutaId, origen, destino, tipoCarga, cantCarga, tarifaSinIVA, tipoIVA, valorIVA, valorViaje, totalViaje, comision, comisionistaId, fleteroId, remito, fcNro, fechaRecepcion, estadoViaje, estadoPago, observaciones } = req.body;
    const viaje = await prisma.viaje.update({
      where: { id },
      data: {
        ...(fecha ? { fecha: new Date(fecha) } : {}),
        ...(clienteId ? { clienteId } : {}),
        rutaId: rutaId || null,
        ...(origen ? { origen } : {}),
        ...(destino ? { destino } : {}),
        tipoCarga, cantCarga: parseF(cantCarga), tarifaSinIVA: parseF(tarifaSinIVA),
        ...(tipoIVA ? { tipoIVA } : {}),
        valorIVA: valorIVA !== undefined ? parseFloat(valorIVA) : 0,
        valorViaje: parseF(valorViaje), totalViaje: parseF(totalViaje),
        comision: comision !== undefined && comision !== '' ? parseFloat(comision) : 0,
        comisionistaId: comisionistaId || null, fleteroId: fleteroId || null,
        remito, fcNro, fechaRecepcion: fechaRecepcion ? new Date(fechaRecepcion) : null,
        ...(estadoViaje ? { estadoViaje } : {}),
        ...(estadoPago ? { estadoPago } : {}),
        observaciones,
      },
      include: viajeInclude,
    });
    res.json(viaje);
  } catch (error) {
    console.error('Error al actualizar viaje:', error);
    res.status(500).json({ error: 'Error al actualizar viaje' });
  }
};

export const deleteViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.viaje.delete({ where: { id } });
    res.json({ message: 'Viaje eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar viaje' });
  }
};
