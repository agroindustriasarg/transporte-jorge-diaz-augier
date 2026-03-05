// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.body;
    const producto = await prisma.producto.create({ data: { nombre } });
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.producto.delete({ where: { id } });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
