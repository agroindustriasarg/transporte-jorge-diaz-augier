// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getFleteros = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.fletero.findMany({
      where: { activo: true },
      include: { comisionista: { select: { id: true, nombre: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener fleteros' });
  }
};

export const createFletero = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, cuit, telefono, email, formaPago, plazo, comisionistaId } = req.body;
    if (!nombre) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    const item = await prisma.fletero.create({
      data: { nombre, cuit, telefono, email, formaPago: formaPago || 'TRANSFERENCIA', plazo: parseInt(plazo || 30), comisionistaId: comisionistaId || null },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear fletero' });
  }
};

export const updateFletero = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, cuit, telefono, email, formaPago, plazo, comisionistaId, activo } = req.body;
    const item = await prisma.fletero.update({
      where: { id },
      data: { nombre, cuit, telefono, email, formaPago, plazo: plazo !== undefined ? parseInt(plazo) : undefined, comisionistaId: comisionistaId || null, activo },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar fletero' });
  }
};

export const deleteFletero = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.fletero.update({ where: { id }, data: { activo: false } });
    res.json({ message: 'Fletero eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar fletero' });
  }
};
