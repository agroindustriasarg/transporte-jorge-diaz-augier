// @ts-nocheck
import { Router } from 'express';
import { getProductos, createProducto, deleteProducto } from '../controllers/productosController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getProductos);
router.post('/', createProducto);
router.delete('/:id', deleteProducto);

export default router;
