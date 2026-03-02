import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAsync, runAsync, allAsync } from '../database';

// Vendors
export const getVendors = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const vendors = await allAsync(
      'SELECT * FROM vendors WHERE event_id = ? ORDER BY created_at DESC',
      [eventId]
    );

    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;
    const { name, service_type, contact, price_estimate, notes } = req.body;

    if (!name || !service_type) {
      return res.status(400).json({ error: 'Name and service_type are required' });
    }

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, eventId, name, service_type, contact || null, price_estimate || 0, notes || null]
    );

    const vendor = await getAsync('SELECT * FROM vendors WHERE id = ?', [id]);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, vendorId } = req.params;

    const vendor = await getAsync('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, service_type, contact, price_estimate, notes } = req.body;

    await runAsync(
      `UPDATE vendors SET name = ?, service_type = ?, contact = ?, price_estimate = ?, notes = ?
       WHERE id = ?`,
      [name || vendor.name, service_type || vendor.service_type, contact !== undefined ? contact : vendor.contact, price_estimate !== undefined ? price_estimate : vendor.price_estimate, notes !== undefined ? notes : vendor.notes, vendorId]
    );

    const updated = await getAsync('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    res.json(updated);
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, vendorId } = req.params;

    const vendor = await getAsync('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM vendors WHERE id = ?', [vendorId]);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
};

// Expenses
export const getExpenses = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const expenses = await allAsync(
      'SELECT * FROM expenses WHERE event_id = ? ORDER BY created_at DESC',
      [eventId]
    );

    // Calculate totals
    const vendors = await allAsync('SELECT price_estimate FROM vendors WHERE event_id = ?', [eventId]);
    const totalEstimated = vendors.reduce((sum, v) => sum + (v.price_estimate || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      expenses,
      summary: {
        totalEstimated,
        totalSpent,
        remaining: totalEstimated - totalSpent,
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.params;
    const { title, amount, payment_status = 'Unpaid', receipt_url } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const id = uuidv4();
    await runAsync(
      `INSERT INTO expenses (id, event_id, title, amount, payment_status, receipt_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, eventId, title, amount, payment_status, receipt_url || null]
    );

    const expense = await getAsync('SELECT * FROM expenses WHERE id = ?', [id]);
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, expenseId } = req.params;

    const expense = await getAsync('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, amount, payment_status, receipt_url } = req.body;

    await runAsync(
      `UPDATE expenses SET title = ?, amount = ?, payment_status = ?, receipt_url = ?
       WHERE id = ?`,
      [title || expense.title, amount !== undefined ? amount : expense.amount, payment_status || expense.payment_status, receipt_url !== undefined ? receipt_url : expense.receipt_url, expenseId]
    );

    const updated = await getAsync('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    res.json(updated);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { eventId, expenseId } = req.params;

    const expense = await getAsync('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const event = await getAsync('SELECT * FROM events WHERE id = ?', [eventId]);
    if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
