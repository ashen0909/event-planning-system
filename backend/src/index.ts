import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initializeDatabase, allAsync, getAsync } from './database';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import guestsRoutes from './routes/guests';
import scheduleRoutes from './routes/schedule';
import budgetRoutes from './routes/budget';
import notificationsRoutes from './routes/notifications';
import venuesRoutes from './routes/venues';
import ticketsRoutes from './routes/tickets';
import registrationsRoutes from './routes/registrations';
import { createNotification } from './controllers/notifications';
import { authMiddleware } from './middleware/auth';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());

// Initialize database
initializeDatabase().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Simple in-memory reminder scheduler for event notifications
const startReminderScheduler = () => {
  const CHECK_INTERVAL_MS = 60 * 1000; // check every minute

  const checkReminders = async () => {
    try {
      const now = new Date();

      // Load all events; for a small app this is fine
      const events = await allAsync(
        'SELECT id, owner_id, title, date, time FROM events',
        []
      );

      for (const event of events) {
        if (!event.date || !event.time) continue;

        const eventDateTime = new Date(`${event.date}T${event.time}:00`);
        if (isNaN(eventDateTime.getTime())) continue;

        // Skip events that finished long ago
        if (eventDateTime.getTime() < now.getTime() - 5 * 60 * 1000) {
          continue;
        }

        const ensureReminder = async (
          offsetMinutes: number,
          type: string,
          titleSuffix: string,
          message: string
        ) => {
          const targetTime = new Date(
            eventDateTime.getTime() - offsetMinutes * 60 * 1000
          );

          // Fire if we're within 1 minute of the target window
          const diff = Math.abs(targetTime.getTime() - now.getTime());
          if (diff > CHECK_INTERVAL_MS) return;

          const existing = await getAsync(
            'SELECT id FROM notifications WHERE event_id = ? AND user_id = ? AND type = ?',
            [event.id, event.owner_id, type]
          );

          if (!existing) {
            await createNotification(
              event.owner_id,
              event.id,
              type,
              `${event.title} ${titleSuffix}`,
              message,
              targetTime.toISOString()
            );
          }
        };

        // 5 minutes before
        await ensureReminder(
          5,
          'reminder_5m',
          '(starting in 5 minutes)',
          `Your event "${event.title}" starts at ${event.time} in 5 minutes.`
        );

        // 1 minute before
        await ensureReminder(
          1,
          'reminder_1m',
          '(starting in 1 minute)',
          `Your event "${event.title}" starts at ${event.time} in 1 minute.`
        );

        // At start time
        await ensureReminder(
          0,
          'reminder_now',
          '(starting now)',
          `Your event "${event.title}" is starting now at ${event.time}.`
        );
      }
    } catch (err) {
      console.error('Reminder scheduler error:', err);
    }
  };

  // Initial delay, then interval
  setTimeout(() => {
    checkReminders();
    setInterval(checkReminders, CHECK_INTERVAL_MS);
  }, 10 * 1000);
};

startReminderScheduler();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/events/:eventId/tickets', ticketsRoutes);
app.use('/api/events/:eventId/registrations', registrationsRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
