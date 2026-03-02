import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from '../controllers/guests';

const router = Router();

router.use(authMiddleware);

router.get('/:eventId/guests', getGuests);
router.post('/:eventId/guests', createGuest);
router.put('/:eventId/guests/:guestId', updateGuest);
router.delete('/:eventId/guests/:guestId', deleteGuest);

export default router;
