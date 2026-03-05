// @ts-nocheck
import { Router } from 'express';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../controllers/clientesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getClientes);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;
