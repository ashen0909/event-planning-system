import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../controllers/tickets';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// /api/events/:eventId/tickets
router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:ticketId', getTicketById);
router.put('/:ticketId', updateTicket);
router.delete('/:ticketId', deleteTicket);

export default router;

