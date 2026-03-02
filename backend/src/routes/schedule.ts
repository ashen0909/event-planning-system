import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getScheduleItems,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/schedule';

const router = Router();

router.use(authMiddleware);

// Schedule routes
router.get('/:eventId/schedule', getScheduleItems);
router.post('/:eventId/schedule', createScheduleItem);
router.put('/:eventId/schedule/:scheduleId', updateScheduleItem);
router.delete('/:eventId/schedule/:scheduleId', deleteScheduleItem);

// Tasks routes
router.get('/:eventId/tasks', getTasks);
router.post('/:eventId/tasks', createTask);
router.put('/:eventId/tasks/:taskId', updateTask);
router.delete('/:eventId/tasks/:taskId', deleteTask);

export default router;
