import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, getAsync, runAsync } from '../database';
import { Sponsor } from '../types';

export const getSponsors = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    let query = 'SELECT * FROM sponsors';
    const params: any[] = [];

    if (req.user.role !== 'ADMIN') {
      query += ' WHERE owner_id = ?';
      params.push(req.user.id);
    }

    const sponsors = await allAsync(query + ' ORDER BY created_at DESC', params);
    res.json(sponsors);
  } catch (error) {
    console.error('Get sponsors error:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
};

export const getSponsorById = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const sponsor = await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]);

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    if (req.user.role !== 'ADMIN' && sponsor.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(sponsor);
  } catch (error) {
    console.error('Get sponsor error:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
};

export const createSponsor = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const {
      name,
      companyType,
      company_type,
      contactPerson,
      contact_person,
      contactEmail,
      contact_email,
      contactPhone,
      contact_phone,
      notes,
    } = req.body as any;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const ownerId = req.user.id;

    await runAsync(
      `INSERT INTO sponsors (id, owner_id, name, company_type, contact_person, contact_email, contact_phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ownerId,
        name,
        companyType ?? company_type ?? null,
        contactPerson ?? contact_person ?? null,
        contactEmail ?? contact_email ?? null,
        contactPhone ?? contact_phone ?? null,
        notes || null,
      ]
    );

    const sponsor = await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]);
    res.status(201).json(sponsor);
  } catch (error) {
    console.error('Create sponsor error:', error);
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
};

export const updateSponsor = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    if (req.user.role !== 'ADMIN' && existing.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      name,
      companyType,
      company_type,
      contactPerson,
      contact_person,
      contactEmail,
      contact_email,
      contactPhone,
      contact_phone,
      notes,
    } = req.body as any;

    await runAsync(
      `UPDATE sponsors
       SET name = ?, company_type = ?, contact_person = ?, contact_email = ?, contact_phone = ?, notes = ?
       WHERE id = ?`,
      [
        name || existing.name,
        companyType ?? company_type ?? existing.company_type,
        contactPerson ?? contact_person ?? existing.contact_person,
        contactEmail ?? contact_email ?? existing.contact_email,
        contactPhone ?? contact_phone ?? existing.contact_phone,
        notes !== undefined ? notes : existing.notes,
        id,
      ]
    );

    const updated = await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Update sponsor error:', error);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const existing = await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    if (req.user.role !== 'ADMIN' && existing.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM sponsors WHERE id = ?', [id]);
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error('Delete sponsor error:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
};

export const getSponsorDeals = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.params;
    const sponsor = await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]);

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    if (req.user.role !== 'ADMIN' && sponsor.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deals = await allAsync(
      `SELECT d.*, e.title as event_title, e.date as event_date
       FROM sponsorship_deals d
       JOIN events e ON d.event_id = e.id
       WHERE d.sponsor_id = ?
       ORDER BY d.created_at DESC`,
      [id]
    );

    res.json(deals);
  } catch (error) {
    console.error('Get sponsor deals error:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor deals' });
  }
};

