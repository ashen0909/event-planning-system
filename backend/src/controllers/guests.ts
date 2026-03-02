import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAsync, runAsync, allAsync } from '../database';
import { Guest } from '../types';

export const getGuests = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;

    // Verify event exists and check access
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const guests = await allAsync(
      'SELECT * FROM guests WHERE event_id = ? ORDER BY created_at DESC',
      [eventId]
    );

    res.json(guests);
  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
};

export const createGuest = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;
    const { name, email, phone, tag, rsvp_status = 'Pending' } = req.body as Guest;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO guests (id, event_id, name, email, phone, tag, rsvp_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, eventId, name, email || null, phone || null, tag || null, rsvp_status]
    );

    const guest = await getAsync('SELECT * FROM guests WHERE id = ?', [id]);
    res.status(201).json(guest);
  } catch (error) {
    console.error('Create guest error:', error);
    res.status(500).json({ error: 'Failed to create guest' });
  }
};

export const updateGuest = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, guestId } = req.params;
    const guest = await getAsync('SELECT * FROM guests WHERE id = ?', [guestId]);

    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, email, phone, tag, rsvp_status } = req.body;

    await runAsync(
      `UPDATE guests SET name = ?, email = ?, phone = ?, tag = ?, rsvp_status = ?
       WHERE id = ?`,
      [
        name || guest.name,
        email !== undefined ? email : guest.email,
        phone !== undefined ? phone : guest.phone,
        tag !== undefined ? tag : guest.tag,
        rsvp_status || guest.rsvp_status,
        guestId,
      ]
    );

    const updated = await getAsync('SELECT * FROM guests WHERE id = ?', [guestId]);
    res.json(updated);
  } catch (error) {
    console.error('Update guest error:', error);
    res.status(500).json({ error: 'Failed to update guest' });
  }
};

export const deleteGuest = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, guestId } = req.params;

    const guest = await getAsync('SELECT * FROM guests WHERE id = ?', [guestId]);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM guests WHERE id = ?', [guestId]);
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
};
