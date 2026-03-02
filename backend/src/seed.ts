import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, runAsync, getAsync } from './database';

require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Initialize tables
    await initializeDatabase();

    console.log('✅ Database tables created');

    // Create seed users if they don't already exist
    const existingAdmin = await getAsync(
      'SELECT id FROM users WHERE email = ?',
      ['admin@example.com']
    );
    const existingUser = await getAsync(
      'SELECT id FROM users WHERE email = ?',
      ['user@example.com']
    );

    const adminId = existingAdmin?.id || uuidv4();
    const userId = existingUser?.id || uuidv4();

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    if (!existingAdmin) {
      await runAsync(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'Admin User', 'admin@example.com', adminPassword, 'ADMIN']
      );
      console.log('✅ Admin user created: admin@example.com / Admin@123');
    } else {
      console.log('ℹ️ Admin user already exists, skipping insert');
    }

    if (!existingUser) {
      await runAsync(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Ashen', 'user@example.com', userPassword, 'USER']
      );
      console.log('✅ User created: user@example.com / User@123');
    } else {
      console.log('ℹ️ Regular user already exists, skipping insert');
    }

    // Create sample venues
    const venueIds = [uuidv4(), uuidv4(), uuidv4()];

    await runAsync(
      `INSERT INTO venues (id, name, location, capacity, price_per_day, contact_person, contact_number, availability_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        venueIds[0],
        'Grand Ballroom, City Hotel',
        'Colombo, Sri Lanka',
        250,
        75000,
        'Hotel Coordinator',
        '+94 11 555 0001',
        'Available',
      ]
    );

    await runAsync(
      `INSERT INTO venues (id, name, location, capacity, price_per_day, contact_person, contact_number, availability_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        venueIds[1],
        'Ocean View Conference Hall',
        'Galle, Sri Lanka',
        180,
        55000,
        'Events Desk',
        '+94 91 555 0022',
        'Available',
      ]
    );

    await runAsync(
      `INSERT INTO venues (id, name, location, capacity, price_per_day, contact_person, contact_number, availability_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        venueIds[2],
        'City Tech Hub Auditorium',
        'Kandy, Sri Lanka',
        120,
        40000,
        'Tech Hub Admin',
        '+94 81 555 0033',
        'Maintenance',
      ]
    );

    console.log('✅ Sample venues created');

    // Create sample events for the user and link them to venues
    const weddingEventId = uuidv4();
    await runAsync(
      `INSERT INTO events (id, owner_id, venue_id, title, description, date, time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        weddingEventId,
        userId,
        venueIds[0],
        'Wedding Celebration',
        'A beautiful wedding ceremony and reception',
        '2024-06-15',
        '18:00',
        'Grand Ballroom, City Hotel',
        'Draft',
      ]
    );

    const conferenceEventId = uuidv4();
    await runAsync(
      `INSERT INTO events (id, owner_id, venue_id, title, description, date, time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conferenceEventId,
        userId,
        venueIds[1],
        'Tech Conference 2024',
        'Full-day conference with keynotes and workshops',
        '2024-07-20',
        '09:00',
        'Ocean View Conference Hall',
        'Published',
      ]
    );

    // Mark first two venues as booked
    await runAsync(
      `UPDATE venues SET availability_status = 'Booked' WHERE id IN (?, ?)`,
      [venueIds[0], venueIds[1]]
    );

    console.log('✅ Sample events created for user');

    // Add sample guests
    const guestIds = [uuidv4(), uuidv4(), uuidv4()];
    for (let i = 0; i < guestIds.length; i++) {
      await runAsync(
        `INSERT INTO guests (id, event_id, name, email, phone, tag, rsvp_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          guestIds[i],
          weddingEventId,
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
      [scheduleIds[0], weddingEventId, 'Arrival & Cocktail', '18:00', '19:00', 'Welcome guests']
    );

    await runAsync(
      `INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [scheduleIds[1], weddingEventId, 'Dinner & Dance', '19:00', '23:00', 'Main reception']
    );

    console.log('✅ Sample schedule items created');

    // Add sample vendors
    const vendorIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendorIds[0], weddingEventId, 'Grand Catering Co.', 'Catering', 'catering@grand.com', 5000, 'Full menu for 200 guests']
    );

    await runAsync(
      `INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendorIds[1], weddingEventId, 'Elite Photography', 'Photography', 'photo@elite.com', 1500, 'Professional photographer and videographer']
    );

    console.log('✅ Sample vendors created');

    // Add sample tasks
    const taskIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskIds[0], weddingEventId, 'Confirm guest list', 'High', 'Doing', '2024-06-01', 'Ashen']
    );

    await runAsync(
      `INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskIds[1], weddingEventId, 'Book venue', 'High', 'Done', '2024-05-01', 'Ashen']
    );

    console.log('✅ Sample tasks created');

    // Add sample expenses
    const expenseIds = [uuidv4(), uuidv4()];
    await runAsync(
      `INSERT INTO expenses (id, event_id, title, amount, payment_status)
       VALUES (?, ?, ?, ?, ?)`,
      [expenseIds[0], weddingEventId, 'Venue deposit', 1000, 'Paid']
    );

    await runAsync(
      `INSERT INTO expenses (id, event_id, title, amount, payment_status)
       VALUES (?, ?, ?, ?, ?)`,
      [expenseIds[1], weddingEventId, 'Decorations', 800, 'Unpaid']
    );

    console.log('✅ Sample expenses created');

    // Add sample tickets for both events
    const weddingVipTicketId = uuidv4();
    const weddingStdTicketId = uuidv4();
    const confStandardTicketId = uuidv4();

    await runAsync(
      `INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        weddingVipTicketId,
        weddingEventId,
        'VIP',
        15000,
        50,
        10,
        '2024-05-01',
        '2024-06-14',
        'Active',
      ]
    );

    await runAsync(
      `INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        weddingStdTicketId,
        weddingEventId,
        'Standard',
        8000,
        200,
        60,
        '2024-05-10',
        '2024-06-14',
        'Active',
      ]
    );

    await runAsync(
      `INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        confStandardTicketId,
        conferenceEventId,
        'Conference Pass',
        12000,
        150,
        40,
        '2024-06-01',
        '2024-07-19',
        'Active',
      ]
    );

    console.log('✅ Sample tickets created');

    // Add sample registrations for tickets
    const regIds = [uuidv4(), uuidv4(), uuidv4()];

    await runAsync(
      `INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        regIds[0],
        weddingEventId,
        weddingVipTicketId,
        'Kasun Perera',
        'kasun@example.com',
        '+94 77 123 4567',
        'Paid',
      ]
    );

    await runAsync(
      `INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        regIds[1],
        weddingEventId,
        weddingStdTicketId,
        'Nimali Fernando',
        'nimali@example.com',
        '+94 71 987 6543',
        'Pending',
      ]
    );

    await runAsync(
      `INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        regIds[2],
        conferenceEventId,
        confStandardTicketId,
        'Dev User',
        'devuser@example.com',
        '+94 75 000 0011',
        'Paid',
      ]
    );

    console.log('✅ Sample registrations created');

    console.log('\n✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
