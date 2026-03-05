// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getPagos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo } = req.query;
    const pagos = await prisma.pago.findMany({
      where: tipo ? { tipo: String(tipo) } : undefined,
      orderBy: { fecha: 'desc' },
    });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

export const createPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tipo, entidadId, entidadNombre, concepto, numeroComprobante,
      moneda, cotizacion, monto, fecha,
      formaPago, chequeNumero, chequeBanco, chequeEmpresa, chequeFechaCobro,
      esCombustible, combProveedor, combLitros, combPrecioLitro, combNFactura, combNOrden,
    } = req.body;
    const cotiz = parseFloat(cotizacion) || 1;
    const monto_ = parseFloat(monto) || 0;
    const pago = await prisma.pago.create({
      data: {
        tipo,
        entidadId: entidadId || null,
        entidadNombre: entidadNombre || null,
        concepto: concepto || null,
        numeroComprobante: numeroComprobante || null,
        moneda: moneda || 'ARS',
        cotizacion: cotiz,
        monto: monto_,
        montoARS: monto_ * cotiz,
        fecha: fecha ? new Date(fecha) : new Date(),
        formaPago: formaPago || null,
        chequeNumero: chequeNumero || null,
        chequeBanco: chequeBanco || null,
        chequeEmpresa: chequeEmpresa || null,
        chequeFechaCobro: chequeFechaCobro ? new Date(chequeFechaCobro) : null,
        esCombustible: !!esCombustible,
        combProveedor: combProveedor || null,
        combLitros: combLitros ? parseFloat(combLitros) : null,
        combPrecioLitro: combPrecioLitro ? parseFloat(combPrecioLitro) : null,
        combNFactura: combNFactura || null,
        combNOrden: combNOrden || null,
      },
    });
    res.status(201).json(pago);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pago' });
  }
};

export const deletePago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.pago.delete({ where: { id } });
    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
};
