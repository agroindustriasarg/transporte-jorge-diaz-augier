// @ts-nocheck
import { Router } from 'express';
import { getFleteros, createFletero, updateFletero, deleteFletero } from '../controllers/fleterosController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);
router.get('/', getFleteros);
router.post('/', createFletero);
router.put('/:id', updateFletero);
router.delete('/:id', deleteFletero);
export default router;
