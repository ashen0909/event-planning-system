import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getSponsorDeals,
} from '../controllers/sponsors';

const router = Router();

router.use(authMiddleware);

router.get('/', getSponsors);
router.post('/', createSponsor);
router.get('/:id', getSponsorById);
router.put('/:id', updateSponsor);
router.delete('/:id', deleteSponsor);
router.get('/:id/deals', getSponsorDeals);

export default router;

