// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getRutas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clienteId } = req.query;
    const rutas = await prisma.ruta.findMany({
      where: { activo: true, ...(clienteId ? { clienteId: clienteId as string } : {}) },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { origen: 'asc' },
    });
    res.json(rutas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
};

export const createRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clienteId, origen, destino, tipoCarga, tarifaSinIVA, comision } = req.body;
    if (!clienteId || !origen || !destino || tarifaSinIVA === undefined) {
      res.status(400).json({ error: 'Faltan campos requeridos' }); return;
    }
    const ruta = await prisma.ruta.create({ data: { clienteId, origen, destino, tipoCarga, tarifaSinIVA: parseFloat(tarifaSinIVA), comision: parseFloat(comision || 0) } });
    res.status(201).json(ruta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ruta' });
  }
};

export const updateRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { clienteId, origen, destino, tipoCarga, tarifaSinIVA, comision, activo } = req.body;
    const ruta = await prisma.ruta.update({
      where: { id },
      data: { clienteId, origen, destino, tipoCarga, tarifaSinIVA: tarifaSinIVA !== undefined ? parseFloat(tarifaSinIVA) : undefined, comision: comision !== undefined ? parseFloat(comision) : undefined, activo },
    });
    res.json(ruta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ruta' });
  }
};

export const deleteRuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.ruta.update({ where: { id }, data: { activo: false } });
    res.json({ message: 'Ruta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ruta' });
  }
};
