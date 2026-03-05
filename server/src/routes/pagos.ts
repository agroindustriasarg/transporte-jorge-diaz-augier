// @ts-nocheck
import { Router } from 'express';
import { getPagos, createPago, deletePago } from '../controllers/pagosController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getPagos);
router.post('/', createPago);
router.delete('/:id', deletePago);

export default router;
