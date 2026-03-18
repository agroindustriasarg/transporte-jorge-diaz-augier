// @ts-nocheck
import { Router } from 'express';
import { getComisionistas, createComisionista, updateComisionista, deleteComisionista } from '../controllers/comisionistasController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);
router.get('/', getComisionistas);
router.post('/', createComisionista);
router.put('/:id', updateComisionista);
router.delete('/:id', deleteComisionista);
export default router;
