import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/venues';

const router = Router();

router.use(authMiddleware);

router.get('/', getVenues);
router.post('/', createVenue);
router.get('/:id', getVenueById);
router.put('/:id', updateVenue);
router.delete('/:id', deleteVenue);

export default router;

