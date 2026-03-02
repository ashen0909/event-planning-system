import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/budget';

const router = Router();

router.use(authMiddleware);

// Vendors routes
router.get('/:eventId/vendors', getVendors);
router.post('/:eventId/vendors', createVendor);
router.put('/:eventId/vendors/:vendorId', updateVendor);
router.delete('/:eventId/vendors/:vendorId', deleteVendor);

// Expenses routes
router.get('/:eventId/expenses', getExpenses);
router.post('/:eventId/expenses', createExpense);
router.put('/:eventId/expenses/:expenseId', updateExpense);
router.delete('/:eventId/expenses/:expenseId', deleteExpense);

export default router;
