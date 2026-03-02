import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notifications';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// GET all notifications for user
router.get('/', getNotifications);

// GET unread count
router.get('/unread/count', getUnreadCount);

// PATCH mark notification as read
router.patch('/:id/read', markAsRead);

// PATCH mark all as read
router.patch('/read-all', markAllAsRead);

// DELETE notification
router.delete('/:id', deleteNotification);

export default router;
