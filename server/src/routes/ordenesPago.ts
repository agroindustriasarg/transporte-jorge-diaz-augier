// @ts-nocheck
import { Router } from 'express';
import { getOrdenesPago, createOrdenPago, updateOrdenPago } from '../controllers/ordenesPagoController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);
router.get('/', getOrdenesPago);
router.post('/', createOrdenPago);
router.put('/:id', updateOrdenPago);
export default router;
