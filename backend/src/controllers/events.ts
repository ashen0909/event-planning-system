import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAsync, runAsync, allAsync } from '../database';
import { Event } from '../types';

export const getEvents = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    let query = 'SELECT * FROM events';
    const params: any[] = [];

    // Non-admins can only see their own events
    if (req.user.role !== 'ADMIN') {
      query += ' WHERE owner_id = ?';
      params.push(req.user.id);
    }

    const events = await allAsync(query + ' ORDER BY date DESC', params);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { title, description, date, time, location, status = 'Draft', cover_image } = req.body as Event;

    if (!title || !date || !time) {
      return res.status(400).json({ error: 'Title, date, and time are required' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO events (id, owner_id, title, description, date, time, location, status, cover_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, title, description || null, date, time, location || null, status, cover_image || null]
    );

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [id]);
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, date, time, location, status, cover_image } = req.body;

    await runAsync(
      `UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, status = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title || event.title, description !== undefined ? description : event.description, date || event.date, time || event.time, location !== undefined ? location : event.location, status || event.status, cover_image !== undefined ? cover_image : event.cover_image, id]
    );

    const updated = await getAsync('SELECT * FROM events WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check access
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};
