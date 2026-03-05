// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getProveedores = async (req: Request, res: Response): Promise<void> => {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const createProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, cuit, telefono, email, direccion, contacto } = req.body;
    const proveedor = await prisma.proveedor.create({
      data: { nombre, cuit, telefono, email, direccion, contacto },
    });
    res.status(201).json(proveedor);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

export const updateProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, cuit, telefono, email, direccion, contacto, activo } = req.body;
    const proveedor = await prisma.proveedor.update({
      where: { id },
      data: { nombre, cuit, telefono, email, direccion, contacto, activo },
    });
    res.json(proveedor);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

export const deleteProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.proveedor.delete({ where: { id } });
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};
