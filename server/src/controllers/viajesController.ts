// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getViajes = async (req: Request, res: Response): Promise<void> => {
  try {
    const viajes = await prisma.viaje.findMany({ orderBy: { fecha: 'desc' } });
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
};

const parseNum = (v: any) => (v !== undefined && v !== '' ? parseFloat(v) : null);

export const createViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, chofer, patente, productoId, cpe, transporte, clienteId, proveedorId, kmRecorridos, kgCargados, kgDescargados, tarifaCliente, tarifaTransporte, descuento, precioPizarra, precioCompra, precioVenta } = req.body;
    const viaje = await prisma.viaje.create({
      data: {
        fecha: new Date(fecha),
        chofer, patente, productoId: productoId || null, cpe, transporte,
        clienteId: clienteId || null,
        proveedorId: proveedorId || null,
        kmRecorridos: parseNum(kmRecorridos),
        kgCargados: parseNum(kgCargados),
        kgDescargados: parseNum(kgDescargados),
        tarifaCliente: parseNum(tarifaCliente),
        tarifaTransporte: parseNum(tarifaTransporte),
        descuento: parseNum(descuento),
        precioPizarra: parseNum(precioPizarra),
        precioCompra: parseNum(precioCompra), precioVenta: parseNum(precioVenta),
      },
    });
    res.status(201).json(viaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear viaje' });
  }
};

export const updateViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fecha, chofer, patente, productoId, cpe, transporte, clienteId, proveedorId, kmRecorridos, kgCargados, kgDescargados, tarifaCliente, tarifaTransporte, descuento, precioPizarra, precioCompra, precioVenta } = req.body;
    const viaje = await prisma.viaje.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        chofer, patente, productoId: productoId || null, cpe, transporte,
        clienteId: clienteId || null,
        proveedorId: proveedorId || null,
        kmRecorridos: parseNum(kmRecorridos),
        kgCargados: parseNum(kgCargados),
        kgDescargados: parseNum(kgDescargados),
        tarifaCliente: parseNum(tarifaCliente),
        tarifaTransporte: parseNum(tarifaTransporte),
        descuento: parseNum(descuento),
        precioPizarra: parseNum(precioPizarra),
        precioCompra: parseNum(precioCompra), precioVenta: parseNum(precioVenta),
      },
    });
    res.json(viaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar viaje' });
  }
};

export const deleteViaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.viaje.delete({ where: { id } });
    res.json({ message: 'Viaje eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar viaje' });
  }
};
