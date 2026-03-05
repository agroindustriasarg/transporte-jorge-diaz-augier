// @ts-nocheck
import { Router } from 'express';
import authRoutes from './auth.js';
import usuariosRoutes from './usuarios.js';
import proveedoresRoutes from './proveedores.js';
import clientesRoutes from './clientes.js';
import viajesRoutes from './viajes.js';
import choferesRoutes from './choferes.js';
import productosRoutes from './productos.js';
import preciosCerealesRoutes from './preciosCereales.js';
import pagosRoutes from './pagos.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/clientes', clientesRoutes);
router.use('/viajes', viajesRoutes);
router.use('/choferes', choferesRoutes);
router.use('/productos', productosRoutes);
router.use('/precios-cereales', preciosCerealesRoutes);
router.use('/pagos', pagosRoutes);

export default router;
