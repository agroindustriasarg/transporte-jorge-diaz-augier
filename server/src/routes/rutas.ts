// @ts-nocheck
import { Router } from 'express';
import { getRutas, createRuta, updateRuta, deleteRuta } from '../controllers/rutasController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);
router.get('/', getRutas);
router.post('/', createRuta);
router.put('/:id', updateRuta);
router.delete('/:id', deleteRuta);
export default router;
