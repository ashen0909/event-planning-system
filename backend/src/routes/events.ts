import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
} from '../controllers/events';

const router = Router();

router.use(authMiddleware);

router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
