import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || './data/events.db';

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Helper to run queries with promises
export const runAsync = (sql: string, params: any[] = []): Promise<{ id?: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

// Helper to get a single row
export const getAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper to get all rows
export const allAsync = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export const initializeDatabase = async () => {
  // Create Users table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Events table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'Draft',
      cover_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // Create Guests table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      tag TEXT,
      rsvp_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  // Create ScheduleItems table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS schedule_items (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  // Create Tasks table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      priority TEXT DEFAULT 'Low',
      status TEXT DEFAULT 'ToDo',
      due_date TEXT,
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  // Create Vendors table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      contact TEXT,
      price_estimate REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  // Create Expenses table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'Unpaid',
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  // Create Notifications table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reminder_time TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
};
