// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getChoferes = async (req: Request, res: Response): Promise<void> => {
  try {
    const choferes = await prisma.chofer.findMany({ orderBy: { apellido: 'asc' } });
    res.json(choferes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener choferes' });
  }
};

export const createChofer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, dni, telefono, transporte, marcaCamion, patenteCamion, patenteAcoplado } = req.body;
    const chofer = await prisma.chofer.create({
      data: { nombre, apellido, dni, telefono, transporte, marcaCamion, patenteCamion, patenteAcoplado },
    });
    res.status(201).json(chofer);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear chofer' });
  }
};

export const updateChofer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, apellido, dni, telefono, transporte, marcaCamion, patenteCamion, patenteAcoplado, activo } = req.body;
    const chofer = await prisma.chofer.update({
      where: { id },
      data: { nombre, apellido, dni, telefono, transporte, marcaCamion, patenteCamion, patenteAcoplado, activo },
    });
    res.json(chofer);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar chofer' });
  }
};

export const deleteChofer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.chofer.delete({ where: { id } });
    res.json({ message: 'Chofer eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar chofer' });
  }
};
