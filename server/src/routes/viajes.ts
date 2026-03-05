// @ts-nocheck
import { Router } from 'express';
import { getViajes, createViaje, updateViaje, deleteViaje } from '../controllers/viajesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getViajes);
router.post('/', createViaje);
router.put('/:id', updateViaje);
router.delete('/:id', deleteViaje);

export default router;
