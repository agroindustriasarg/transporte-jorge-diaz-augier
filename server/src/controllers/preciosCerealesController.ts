// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { scrapePreciosCereales } from '../services/cerealesScraper.js';

const CEREALES = ['TRIGO', 'MAÍZ', 'GIRASOL', 'SOJA', 'SORGO'];

export const getPreciosCereales = async (req: Request, res: Response): Promise<void> => {
  try {
    const precios = await prisma.precioCereal.findMany({
      orderBy: { cereal: 'asc' },
    });

    // Si no existen registros, devolver los 5 cereales con precio 0
    if (precios.length === 0) {
      const iniciales = CEREALES.map((c) => ({
        id: c,
        cereal: c,
        precio: 0,
        difPesos: 0,
        difPct: 0,
        tendencia: 'up',
        updatedAt: new Date(),
      }));
      res.json(iniciales);
      return;
    }

    // Ordenar según el orden definido
    const ordered = CEREALES.map((c) => precios.find((p) => p.cereal === c)).filter(Boolean);
    res.json(ordered);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener precios de cereales' });
  }
};

export const scrapeDesdeBCR = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await scrapePreciosCereales();
    res.json({ ok: true, actualizados: Object.keys(results).length, data: results });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al scrapear BCR: ' + error.message });
  }
};

export const upsertPrecioCereal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cereal, precio, difPesos, difPct, tendencia } = req.body;
    const precio_ = await prisma.precioCereal.upsert({
      where: { cereal },
      update: {
        precio: parseFloat(precio) || 0,
        difPesos: parseFloat(difPesos) || 0,
        difPct: parseFloat(difPct) || 0,
        tendencia: tendencia || 'up',
      },
      create: {
        cereal,
        precio: parseFloat(precio) || 0,
        difPesos: parseFloat(difPesos) || 0,
        difPct: parseFloat(difPct) || 0,
        tendencia: tendencia || 'up',
      },
    });
    res.json(precio_);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar precio de cereal' });
  }
};
