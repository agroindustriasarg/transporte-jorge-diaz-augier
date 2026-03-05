// @ts-nocheck
import { Router } from 'express';
import { getChoferes, createChofer, updateChofer, deleteChofer } from '../controllers/choferesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getChoferes);
router.post('/', createChofer);
router.put('/:id', updateChofer);
router.delete('/:id', deleteChofer);

export default router;
