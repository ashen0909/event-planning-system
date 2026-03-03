import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getDealsForEvent,
  createDeal,
  updateDeal,
  deleteDeal,
} from '../controllers/sponsorships';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// /api/events/:eventId/sponsorships
router.get('/', getDealsForEvent);
router.post('/', createDeal);
router.put('/:dealId', updateDeal);
router.delete('/:dealId', deleteDeal);

export default router;

