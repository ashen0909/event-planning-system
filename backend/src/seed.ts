import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, runAsync } from './database';

require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Initialize tables
    await initializeDatabase();

    console.log('✅ Database tables created');

    // Create seed users
    const adminId = uuidv4();
    const userId = uuidv4();

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // Insert admin user
    await runAsync(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'Admin User', 'admin@example.com', adminPassword, 'ADMIN']
    );

    console.log('✅ Admin user created: admin@example.com / Admin@123');

    // Insert regular user
    await runAsync(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, 'John Doe', 'user@example.com', userPassword, 'USER']
    );

    console.log('✅ User created: user@example.com / User@123');

    // Create sample event for the user
    const eventId = uuidv4();
    await runAsync(
      `INSERT INTO events (id, owner_id, title, description, date, time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        userId,
        'Wedding Celebration',
        'A beautiful wedding ceremony and reception',
        '2024-06-15',
        '18:00',
        'Grand Ballroom, City Hotel',
        'Draft',
      ]
    );

    console.log('✅ Sample event created for user');

    // Add sample guests
    const guestIds = [uuidv4(), uuidv4(), uuidv4()];
    for (let i = 0; i < guestIds.length; i++) {
      await runAsync(
        `INSERT INTO guests (id, event_id, name, email, phone, tag, rsvp_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          guestIds[i],
          eventId,
          `Guest ${i + 1}`,
          `guest${i + 1}@example.com`,
          `555-000${i}`,
          i === 0 ? 'VIP' : 'Family',
          'Pending',
        ]
      );
    }

    console.log('✅ Sample guests created');

    // Add sample schedule items
    const scheduleIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [scheduleIds[0], eventId, 'Arrival & Cocktail', '18:00', '19:00', 'Welcome guests']
    );

    await runAsync(
      `INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [scheduleIds[1], eventId, 'Dinner & Dance', '19:00', '23:00', 'Main reception']
    );

    console.log('✅ Sample schedule items created');

    // Add sample vendors
    const vendorIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendorIds[0], eventId, 'Grand Catering Co.', 'Catering', 'catering@grand.com', 5000, 'Full menu for 200 guests']
    );

    await runAsync(
      `INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendorIds[1], eventId, 'Elite Photography', 'Photography', 'photo@elite.com', 1500, 'Professional photographer and videographer']
    );

    console.log('✅ Sample vendors created');

    // Add sample tasks
    const taskIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskIds[0], eventId, 'Confirm guest list', 'High', 'Doing', '2024-06-01', 'John Doe']
    );

    await runAsync(
      `INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskIds[1], eventId, 'Book venue', 'High', 'Done', '2024-05-01', 'John Doe']
    );

    console.log('✅ Sample tasks created');

    // Add sample expenses
    const expenseIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO expenses (id, event_id, title, amount, payment_status)
       VALUES (?, ?, ?, ?, ?)`,
      [expenseIds[0], eventId, 'Venue deposit', 1000, 'Paid']
    );

    await runAsync(
      `INSERT INTO expenses (id, event_id, title, amount, payment_status)
       VALUES (?, ?, ?, ?, ?)`,
      [expenseIds[1], eventId, 'Decorations', 800, 'Unpaid']
    );

    console.log('✅ Sample expenses created');

    console.log('\n✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
