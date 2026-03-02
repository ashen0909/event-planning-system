import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, getAsync, runAsync } from '../database';
import { Ticket } from '../types';

export const getTickets = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const tickets = await allAsync(
      'SELECT * FROM tickets WHERE event_id = ? ORDER BY created_at DESC',
      [eventId]
    );
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const ticket = await getAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const {
      name,
      price,
      totalQuantity,
      total_quantity,
      saleStartDate,
      sale_start_date,
      saleEndDate,
      sale_end_date,
      status = 'Active',
    } = req.body as any;

    const resolvedTotalQuantity = totalQuantity ?? total_quantity;
    const resolvedSaleStartDate = saleStartDate ?? sale_start_date;
    const resolvedSaleEndDate = saleEndDate ?? sale_end_date;

    if (!name || price === undefined || resolvedTotalQuantity === undefined) {
      return res
        .status(400)
        .json({ error: 'Name, price and totalQuantity are required' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        id,
        eventId,
        name,
        price,
        resolvedTotalQuantity,
        resolvedSaleStartDate || null,
        resolvedSaleEndDate || null,
        status,
      ]
    );

    const ticket = await getAsync('SELECT * FROM tickets WHERE id = ?', [id]);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const existing = await getAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);

    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const {
      name,
      price,
      totalQuantity,
      total_quantity,
      saleStartDate,
      sale_start_date,
      saleEndDate,
      sale_end_date,
      status,
    } = req.body as any;

    const resolvedTotalQuantity = totalQuantity ?? total_quantity;
    const resolvedSaleStartDate = saleStartDate ?? sale_start_date;
    const resolvedSaleEndDate = saleEndDate ?? sale_end_date;

    await runAsync(
      `UPDATE tickets
       SET name = ?, price = ?, total_quantity = ?, sale_start_date = ?, sale_end_date = ?, status = ?
       WHERE id = ?`,
      [
        name || existing.name,
        price !== undefined ? price : existing.price,
        resolvedTotalQuantity !== undefined ? resolvedTotalQuantity : existing.total_quantity,
        resolvedSaleStartDate !== undefined ? resolvedSaleStartDate : existing.sale_start_date,
        resolvedSaleEndDate !== undefined ? resolvedSaleEndDate : existing.sale_end_date,
        status || existing.status,
        ticketId,
      ]
    );

    const updated = await getAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    res.json(updated);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const existing = await getAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);

    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await runAsync('DELETE FROM tickets WHERE id = ?', [ticketId]);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

// Helper to update ticket status based on quantity and sale dates
export const refreshTicketStatus = async (ticketId: string) => {
  const ticket = await getAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  if (!ticket) return;

  const now = new Date();
  const saleEnd = ticket.sale_end_date ? new Date(ticket.sale_end_date) : null;

  let newStatus: Ticket['status'] = ticket.status;

  if (ticket.sold_quantity >= ticket.total_quantity) {
    newStatus = 'SoldOut';
  } else if (saleEnd && now > saleEnd) {
    newStatus = 'Closed';
  } else {
    newStatus = 'Active';
  }

  if (newStatus !== ticket.status) {
    await runAsync('UPDATE tickets SET status = ? WHERE id = ?', [newStatus, ticketId]);
  }
};

