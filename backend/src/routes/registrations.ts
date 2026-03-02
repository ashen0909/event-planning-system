import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} from '../controllers/registrations';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// /api/events/:eventId/registrations
router.get('/', getRegistrations);
router.post('/', createRegistration);
router.put('/:registrationId', updateRegistration);
router.delete('/:registrationId', deleteRegistration);

export default router;

