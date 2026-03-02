import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, getAsync, runAsync } from '../database';
import { Venue } from '../types';

export const getVenues = async (req: Request, res: Response) => {
  try {
    const venues = await allAsync('SELECT * FROM venues ORDER BY created_at DESC', []);
    res.json(venues);
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
};

export const getVenueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const venue = await getAsync('SELECT * FROM venues WHERE id = ?', [id]);

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(venue);
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
};

export const createVenue = async (req: Request, res: Response) => {
  try {
    const {
      name,
      location,
      capacity,
      pricePerDay,
      price_per_day,
      contactPerson,
      contact_person,
      contactNumber,
      contact_number,
      availabilityStatus = 'Available',
      availability_status,
    } = req.body as any as {
      name: string;
      location?: string;
      capacity?: number;
      pricePerDay?: number;
      price_per_day?: number;
      contactPerson?: string;
      contact_person?: string;
      contactNumber?: string;
      contact_number?: string;
      availabilityStatus?: Venue['availability_status'];
      availability_status?: Venue['availability_status'];
    };

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const resolvedPricePerDay = pricePerDay ?? price_per_day;
    const resolvedContactPerson = contactPerson ?? contact_person;
    const resolvedContactNumber = contactNumber ?? contact_number;
    const resolvedAvailability = availabilityStatus ?? availability_status ?? 'Available';

    await runAsync(
      `INSERT INTO venues (id, name, location, capacity, price_per_day, contact_person, contact_number, availability_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        location || null,
        capacity ?? null,
        resolvedPricePerDay ?? null,
        resolvedContactPerson || null,
        resolvedContactNumber || null,
        resolvedAvailability,
      ]
    );

    const venue = await getAsync('SELECT * FROM venues WHERE id = ?', [id]);
    res.status(201).json(venue);
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
};

export const updateVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM venues WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const {
      name,
      location,
      capacity,
      pricePerDay,
      price_per_day,
      contactPerson,
      contact_person,
      contactNumber,
      contact_number,
      availabilityStatus,
      availability_status,
    } = req.body as any;

    const resolvedPricePerDay = pricePerDay ?? price_per_day;
    const resolvedContactPerson = contactPerson ?? contact_person;
    const resolvedContactNumber = contactNumber ?? contact_number;
    const resolvedAvailability = availabilityStatus ?? availability_status;

    await runAsync(
      `UPDATE venues
       SET name = ?, location = ?, capacity = ?, price_per_day = ?, contact_person = ?, contact_number = ?, availability_status = ?
       WHERE id = ?`,
      [
        name || existing.name,
        location !== undefined ? location : existing.location,
        capacity !== undefined ? capacity : existing.capacity,
        resolvedPricePerDay !== undefined ? resolvedPricePerDay : existing.price_per_day,
        resolvedContactPerson !== undefined ? resolvedContactPerson : existing.contact_person,
        resolvedContactNumber !== undefined ? resolvedContactNumber : existing.contact_number,
        resolvedAvailability || existing.availability_status,
        id,
      ]
    );

    const updated = await getAsync('SELECT * FROM venues WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ error: 'Failed to update venue' });
  }
};

export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM venues WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    await runAsync('DELETE FROM venues WHERE id = ?', [id]);
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
};

