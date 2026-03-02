import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAsync, runAsync, allAsync } from '../database';
import { ScheduleItem } from '../types';

// Schedule Items
export const getScheduleItems = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await allAsync(
      'SELECT * FROM schedule_items WHERE event_id = ? ORDER BY start_time ASC',
      [eventId]
    );

    res.json(items);
  } catch (error) {
    console.error('Get schedule items error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule items' });
  }
};

export const createScheduleItem = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;
    const { title, start_time, end_time, notes } = req.body as ScheduleItem;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, start_time, and end_time are required' });
    }

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, eventId, title, start_time, end_time, notes || null]
    );

    const item = await getAsync('SELECT * FROM schedule_items WHERE id = ?', [id]);
    res.status(201).json(item);
  } catch (error) {
    console.error('Create schedule item error:', error);
    res.status(500).json({ error: 'Failed to create schedule item' });
  }
};

export const updateScheduleItem = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, scheduleId } = req.params;

    const item = await getAsync('SELECT * FROM schedule_items WHERE id = ?', [scheduleId]);
    if (!item) return res.status(404).json({ error: 'Schedule item not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, start_time, end_time, notes } = req.body;

    await runAsync(
      `UPDATE schedule_items SET title = ?, start_time = ?, end_time = ?, notes = ?
       WHERE id = ?`,
      [title || item.title, start_time || item.start_time, end_time || item.end_time, notes !== undefined ? notes : item.notes, scheduleId]
    );

    const updated = await getAsync('SELECT * FROM schedule_items WHERE id = ?', [scheduleId]);
    res.json(updated);
  } catch (error) {
    console.error('Update schedule item error:', error);
    res.status(500).json({ error: 'Failed to update schedule item' });
  }
};

export const deleteScheduleItem = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, scheduleId } = req.params;

    const item = await getAsync('SELECT * FROM schedule_items WHERE id = ?', [scheduleId]);
    if (!item) return res.status(404).json({ error: 'Schedule item not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM schedule_items WHERE id = ?', [scheduleId]);
    res.json({ message: 'Schedule item deleted successfully' });
  } catch (error) {
    console.error('Delete schedule item error:', error);
    res.status(500).json({ error: 'Failed to delete schedule item' });
  }
};

// Tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await allAsync(
      'SELECT * FROM tasks WHERE event_id = ? ORDER BY due_date ASC',
      [eventId]
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;
    const { title, priority = 'Low', status = 'ToDo', due_date, assigned_to } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, eventId, title, priority, status, due_date || null, assigned_to || null]
    );

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, taskId } = req.params;

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, priority, status, due_date, assigned_to } = req.body;

    await runAsync(
      `UPDATE tasks SET title = ?, priority = ?, status = ?, due_date = ?, assigned_to = ?
       WHERE id = ?`,
      [title || task.title, priority || task.priority, status || task.status, due_date !== undefined ? due_date : task.due_date, assigned_to !== undefined ? assigned_to : task.assigned_to, taskId]
    );

    const updated = await getAsync('SELECT * FROM tasks WHERE id = ?', [taskId]);
    res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, taskId } = req.params;

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM tasks WHERE id = ?', [taskId]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
