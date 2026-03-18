// @ts-nocheck
import { Router } from 'express';
import authRoutes from './auth.js';
import usuariosRoutes from './usuarios.js';
import clientesRoutes from './clientes.js';
import rutasRoutes from './rutas.js';
import comisionistasRoutes from './comisionistas.js';
import fleterosRoutes from './fleteros.js';
import viajesRoutes from './viajes.js';
import ordenesPagoRoutes from './ordenesPago.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/rutas', rutasRoutes);
router.use('/comisionistas', comisionistasRoutes);
router.use('/fleteros', fleterosRoutes);
router.use('/viajes', viajesRoutes);
router.use('/ordenes-pago', ordenesPagoRoutes);

export default router;
