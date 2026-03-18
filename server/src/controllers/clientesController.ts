// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientes = await prisma.cliente.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, cuit, telefono, email, contacto } = req.body;
    if (!nombre) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    const cliente = await prisma.cliente.create({ data: { nombre, cuit, telefono, email, contacto } });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

export const updateCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, cuit, telefono, email, contacto, activo } = req.body;
    const cliente = await prisma.cliente.update({ where: { id }, data: { nombre, cuit, telefono, email, contacto, activo } });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.cliente.update({ where: { id }, data: { activo: false } });
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};
