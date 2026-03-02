import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../database';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;
    const notifications = await allAsync(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;

    // Verify notification belongs to user
    const notification = await getAsync(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await runAsync(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;
    await runAsync(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;

    // Verify notification belongs to user
    const notification = await getAsync(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await runAsync(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const createNotification = async (
  userId: string,
  eventId: string | null,
  type: string,
  title: string,
  message: string,
  reminderTime?: string
) => {
  try {
    const notificationId = uuidv4();
    await runAsync(
      `INSERT INTO notifications (id, user_id, event_id, type, title, message, reminder_time, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [notificationId, userId, eventId, type, title, message, reminderTime || null]
    );
    return notificationId;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;
    const result = await getAsync(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    res.json({ unreadCount: result?.count || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
