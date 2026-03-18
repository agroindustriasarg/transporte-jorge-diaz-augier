// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getComisionistas = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.comisionista.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comisionistas' });
  }
};

export const createComisionista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, cuit, telefono, email } = req.body;
    if (!nombre) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    const item = await prisma.comisionista.create({ data: { nombre, cuit, telefono, email } });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear comisionista' });
  }
};

export const updateComisionista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, cuit, telefono, email, activo } = req.body;
    const item = await prisma.comisionista.update({ where: { id }, data: { nombre, cuit, telefono, email, activo } });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar comisionista' });
  }
};

export const deleteComisionista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.comisionista.update({ where: { id }, data: { activo: false } });
    res.json({ message: 'Comisionista eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar comisionista' });
  }
};
