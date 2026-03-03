import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, getAsync, runAsync } from '../database';

export const getDealsForEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { eventId } = req.params;

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deals = await allAsync(
      `SELECT d.*, s.name as sponsor_name
       FROM sponsorship_deals d
       JOIN sponsors s ON d.sponsor_id = s.id
       WHERE d.event_id = ?
       ORDER BY d.created_at DESC`,
      [eventId]
    );

    res.json(deals);
  } catch (error) {
    console.error('Get sponsorship deals error:', error);
    res.status(500).json({ error: 'Failed to fetch sponsorship deals' });
  }
};

export const createDeal = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { eventId } = req.params;
    const {
      sponsorId,
      sponsor_id,
      amount,
      package: pkg,
      benefits,
      dealStatus,
      deal_status,
      paymentStatus,
      payment_status,
    } = req.body as any;

    const resolvedSponsorId = sponsorId ?? sponsor_id;
    const resolvedDealStatus = dealStatus ?? deal_status ?? 'Proposed';
    const resolvedPaymentStatus = paymentStatus ?? payment_status ?? 'Pending';

    if (!resolvedSponsorId) {
      return res.status(400).json({ error: 'Sponsor is required' });
    }

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sponsor = await getAsync('SELECT * FROM sponsors WHERE id = ?', [
      resolvedSponsorId,
    ]);
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    if (req.user.role !== 'ADMIN' && sponsor.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied for this sponsor' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO sponsorship_deals (id, sponsor_id, event_id, amount, package, benefits, deal_status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        resolvedSponsorId,
        eventId,
        amount ?? null,
        pkg ?? null,
        benefits ?? null,
        resolvedDealStatus,
        resolvedPaymentStatus,
      ]
    );

    const deal = await getAsync('SELECT * FROM sponsorship_deals WHERE id = ?', [id]);
    res.status(201).json(deal);
  } catch (error) {
    console.error('Create sponsorship deal error:', error);
    res.status(500).json({ error: 'Failed to create sponsorship deal' });
  }
};

export const updateDeal = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { eventId, dealId } = req.params;

    const deal = await getAsync('SELECT * FROM sponsorship_deals WHERE id = ?', [
      dealId,
    ]);
    if (!deal || deal.event_id !== eventId) {
      return res.status(404).json({ error: 'Sponsorship deal not found' });
    }

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      amount,
      package: pkg,
      benefits,
      dealStatus,
      deal_status,
      paymentStatus,
      payment_status,
    } = req.body as any;

    const resolvedDealStatus = dealStatus ?? deal_status;
    const resolvedPaymentStatus = paymentStatus ?? payment_status;

    await runAsync(
      `UPDATE sponsorship_deals
       SET amount = ?, package = ?, benefits = ?, deal_status = ?, payment_status = ?
       WHERE id = ?`,
      [
        amount !== undefined ? amount : deal.amount,
        pkg !== undefined ? pkg : deal.package,
        benefits !== undefined ? benefits : deal.benefits,
        resolvedDealStatus || deal.deal_status,
        resolvedPaymentStatus || deal.payment_status,
        dealId,
      ]
    );

    const updated = await getAsync('SELECT * FROM sponsorship_deals WHERE id = ?', [
      dealId,
    ]);
    res.json(updated);
  } catch (error) {
    console.error('Update sponsorship deal error:', error);
    res.status(500).json({ error: 'Failed to update sponsorship deal' });
  }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { eventId, dealId } = req.params;

    const deal = await getAsync('SELECT * FROM sponsorship_deals WHERE id = ?', [
      dealId,
    ]);
    if (!deal || deal.event_id !== eventId) {
      return res.status(404).json({ error: 'Sponsorship deal not found' });
    }

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM sponsorship_deals WHERE id = ?', [dealId]);
    res.json({ message: 'Sponsorship deal deleted successfully' });
  } catch (error) {
    console.error('Delete sponsorship deal error:', error);
    res.status(500).json({ error: 'Failed to delete sponsorship deal' });
  }
};

