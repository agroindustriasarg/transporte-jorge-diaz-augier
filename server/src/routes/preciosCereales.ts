// @ts-nocheck
import { Router } from 'express';
import { getPreciosCereales, upsertPrecioCereal, scrapeDesdeBCR } from '../controllers/preciosCerealesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getPreciosCereales);
router.post('/', upsertPrecioCereal);
router.post('/scrape', scrapeDesdeBCR);

export default router;
