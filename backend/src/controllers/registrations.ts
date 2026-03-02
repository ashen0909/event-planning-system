import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, getAsync, runAsync } from '../database';
import { refreshTicketStatus } from './tickets';

const recalculateTicketQuantities = async (ticketId: string) => {
  const counts = await getAsync(
    `SELECT
       SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END) as paid,
       SUM(CASE WHEN payment_status != 'Cancelled' THEN 1 ELSE 0 END) as active
     FROM registrations
     WHERE ticket_id = ?`,
    [ticketId]
  );

  const paid = counts?.paid ?? 0;

  // Store only paid count as sold_quantity
  await runAsync('UPDATE tickets SET sold_quantity = ? WHERE id = ?', [
    paid,
    ticketId,
  ]);

  await refreshTicketStatus(ticketId);
};

export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const registrations = await allAsync(
      'SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC',
      [eventId]
    );
    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const createRegistration = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const {
      ticketId,
      ticket_id,
      attendeeName,
      attendee_name,
      attendeeEmail,
      attendee_email,
      attendeePhone,
      attendee_phone,
      paymentStatus = 'Pending',
      payment_status,
    } = req.body as any;

    const resolvedTicketId = ticketId ?? ticket_id;
    const resolvedAttendeeName = attendeeName ?? attendee_name;
    const resolvedAttendeeEmail = attendeeEmail ?? attendee_email;
    const resolvedAttendeePhone = attendeePhone ?? attendee_phone;
    const resolvedPaymentStatus = paymentStatus ?? payment_status ?? 'Pending';

    if (!resolvedTicketId || !resolvedAttendeeName) {
      return res
        .status(400)
        .json({ error: 'ticketId and attendeeName are required' });
    }

    const ticket = await getAsync(
      'SELECT * FROM tickets WHERE id = ? AND event_id = ?',
      [resolvedTicketId, eventId]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found for this event' });
    }

    if (ticket.status === 'SoldOut' || ticket.status === 'Closed') {
      return res
        .status(400)
        .json({ error: 'Ticket sales are closed for this type' });
    }

    // Enforce capacity based on non-cancelled registrations
    const activeCounts = await getAsync(
      `SELECT COUNT(*) as active
       FROM registrations
       WHERE ticket_id = ? AND payment_status != 'Cancelled'`,
      [resolvedTicketId]
    );
    const active = activeCounts?.active ?? 0;

    if (active >= ticket.total_quantity) {
      return res
        .status(400)
        .json({ error: 'No tickets remaining for this type' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        eventId,
        resolvedTicketId,
        resolvedAttendeeName,
        resolvedAttendeeEmail || null,
        resolvedAttendeePhone || null,
        resolvedPaymentStatus,
      ]
    );

    // Recalculate sold quantity based on paid registrations
    await recalculateTicketQuantities(resolvedTicketId);

    const registration = await getAsync('SELECT * FROM registrations WHERE id = ?', [id]);
    res.status(201).json(registration);
  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
};

export const updateRegistration = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const existing = await getAsync(
      'SELECT * FROM registrations WHERE id = ?',
      [registrationId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const {
      attendeeName,
      attendee_name,
      attendeeEmail,
      attendee_email,
      attendeePhone,
      attendee_phone,
      paymentStatus,
      payment_status,
    } = req.body as any;

    const resolvedAttendeeName = attendeeName ?? attendee_name;
    const resolvedAttendeeEmail = attendeeEmail ?? attendee_email;
    const resolvedAttendeePhone = attendeePhone ?? attendee_phone;
    const resolvedPaymentStatus = paymentStatus ?? payment_status;

    await runAsync(
      `UPDATE registrations
       SET attendee_name = ?, attendee_email = ?, attendee_phone = ?, payment_status = ?
       WHERE id = ?`,
      [
        resolvedAttendeeName || existing.attendee_name,
        resolvedAttendeeEmail !== undefined ? resolvedAttendeeEmail : existing.attendee_email,
        resolvedAttendeePhone !== undefined ? resolvedAttendeePhone : existing.attendee_phone,
        resolvedPaymentStatus || existing.payment_status,
        registrationId,
      ]
    );

    // Recalculate ticket quantities as payment status may have changed
    await recalculateTicketQuantities(existing.ticket_id);

    const updated = await getAsync('SELECT * FROM registrations WHERE id = ?', [
      registrationId,
    ]);
    res.json(updated);
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
};

export const deleteRegistration = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const existing = await getAsync(
      'SELECT * FROM registrations WHERE id = ?',
      [registrationId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await runAsync('DELETE FROM registrations WHERE id = ?', [registrationId]);

    // Recalculate ticket quantities after removal
    await recalculateTicketQuantities(existing.ticket_id);

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
};

