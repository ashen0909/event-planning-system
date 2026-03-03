# Event Planning System

A modern, full-stack web application for planning and managing events with role-based access control. Built with React, TypeScript, Vite, TailwindCSS, Node.js, Express, and SQLite.

## Features

**Core Features**
- Secure JWT authentication with role-based access (ADMIN/USER)
- Complete event management (CRUD operations)
- Guest management with RSVP tracking
- Event scheduling with timeline view
- Task management with kanban board
- Budget tracking with vendor and expense management
- Real-time budget progress visualization
- Modern, responsive UI with TailwindCSS
- Toast notifications for all actions
- Interactive calendar view with clickable events
- Smart notifications system with slide-in notifications panel
- Advanced analytics and reporting dashboard with PDF export
- Venue management with availability tracking (Available / Booked / Maintenance)
- Event ticketing and registration (multiple ticket types, capacities, payment status tracking)
- Sponsor management with sponsorship deals, benefits, and payment tracking

## Project Structure

```
event-planning-system/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth & validation
│   │   ├── types/             # TypeScript interfaces
│   │   ├── database.ts        # SQLite setup
│   │   ├── seed.ts            # Database seeding
│   │   └── index.ts           # Server entry point
│   ├── data/                  # SQLite database file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/                   # React/Vite application
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── services/         # API client
    │   ├── context/          # React context (Auth, Toast)
    │   ├── types/            # TypeScript interfaces
    │   ├── App.tsx           # Main app component
    │   ├── main.tsx          # Entry point
    │   └── index.css         # Global styles
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## Prerequisites

- Node.js >= 16.x
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

The `.env` file will contain:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/events.db
```

4. Seed the database with sample data:
```bash
npm run seed
```

This will create:
- Admin user: `admin@example.com` / `Admin@123`
- Regular user: `user@example.com` / `User@123`
- Sample venues with different availability states
- Sample events linked to venues
- Sample guests, schedule, tasks, vendors, and expenses
- Sample tickets and registrations for ticketing and reporting

5. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Build

**Backend:**
```bash
cd backend
npm i
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm i
npm run dev
```

## Demo Credentials

After seeding the database, use these credentials to login:

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `Admin@123`
- **Permissions:** Can view and manage all events, guests, schedules, and budgets

### User Account
- **Email:** `user@example.com`
- **Password:** `User@123`
- **Permissions:** Can only view and manage their own events and related data

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Notifications
- `GET /api/notifications` - Get all notifications for user
- `GET /api/notifications/unread/count` - Get unread notification count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Events
- `GET /api/events` - Get all events (filtered by role)
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Guests
- `GET /api/guests/:eventId/guests` - Get event guests
- `POST /api/guests/:eventId/guests` - Add guest
- `PUT /api/guests/:eventId/guests/:guestId` - Update guest
- `DELETE /api/guests/:eventId/guests/:guestId` - Delete guest

### Schedule
- `GET /api/schedule/:eventId/schedule` - Get schedule items
- `POST /api/schedule/:eventId/schedule` - Create schedule item
- `PUT /api/schedule/:eventId/schedule/:scheduleId` - Update schedule
- `DELETE /api/schedule/:eventId/schedule/:scheduleId` - Delete schedule

- `GET /api/schedule/:eventId/tasks` - Get tasks
- `POST /api/schedule/:eventId/tasks` - Create task
- `PUT /api/schedule/:eventId/tasks/:taskId` - Update task
- `DELETE /api/schedule/:eventId/tasks/:taskId` - Delete task

### Budget
- `GET /api/budget/:eventId/vendors` - Get vendors
- `POST /api/budget/:eventId/vendors` - Add vendor
- `PUT /api/budget/:eventId/vendors/:vendorId` - Update vendor
- `DELETE /api/budget/:eventId/vendors/:vendorId` - Delete vendor

- `GET /api/budget/:eventId/expenses` - Get expenses
- `POST /api/budget/:eventId/expenses` - Add expense
- `PUT /api/budget/:eventId/expenses/:expenseId` - Update expense
- `DELETE /api/budget/:eventId/expenses/:expenseId` - Delete expense

### Venues
- `GET /api/venues` - Get all venues
- `POST /api/venues` - Create venue
- `GET /api/venues/:id` - Get venue by ID
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

### Tickets
- `GET /api/events/:eventId/tickets` - Get ticket types for an event
- `POST /api/events/:eventId/tickets` - Create ticket type
- `GET /api/events/:eventId/tickets/:ticketId` - Get ticket type by ID
- `PUT /api/events/:eventId/tickets/:ticketId` - Update ticket type
- `DELETE /api/events/:eventId/tickets/:ticketId` - Delete ticket type

### Registrations
- `GET /api/events/:eventId/registrations` - Get registrations for an event
- `POST /api/events/:eventId/registrations` - Create registration
- `PUT /api/events/:eventId/registrations/:registrationId` - Update registration
- `DELETE /api/events/:eventId/registrations/:registrationId` - Delete registration

### Sponsors
- `GET /api/sponsors` - Get sponsors (all for admin, own for user)
- `POST /api/sponsors` - Create sponsor
- `GET /api/sponsors/:id` - Get sponsor by ID
- `PUT /api/sponsors/:id` - Update sponsor
- `DELETE /api/sponsors/:id` - Delete sponsor
- `GET /api/sponsors/:id/deals` - Get all sponsorship deals for a sponsor (history)

### Sponsorship Deals
- `GET /api/events/:eventId/sponsorships` - Get sponsorship deals for an event
- `POST /api/events/:eventId/sponsorships` - Create sponsorship deal
- `PUT /api/events/:eventId/sponsorships/:dealId` - Update sponsorship deal
- `DELETE /api/events/:eventId/sponsorships/:dealId` - Delete sponsorship deal


## Features in Detail

### 1. Authentication & Authorization (login)
- JWT-based authentication
- Secure password hashing with bcryptjs
- Role-based access control (ADMIN/USER)
- Protected routes and API endpoints
- HttpOnly cookies for token storage

### 2. Event Management
- Create, read, update, delete events
- Event status tracking (Draft, Published, Cancelled)
- Users can only manage their own events
- Admins can manage all events

### 3. Guest Management
- Add and manage event guests
- Track RSVP status (Pending, Going, Maybe, NotGoing)
- Guest categorization (VIP, Family, Friends, Work)
- Contact information storage

### 4. Schedule & Tasks
- Timeline view for event schedule
- Kanban board for task management
- Task priorities (Low, Medium, High)
- Task status tracking (To Do, In Progress, Done)
- Due date assignment

### 5. Budget Management
- Vendor management with service types
- Expense tracking and payment status
- Real-time budget calculation
- Visual progress bar for spending
- Budget summary dashboard
 
### 6. Venue Management
- Create and manage venues with key details (capacity, price per day, contacts)
- Availability tracking (Available, Booked, Maintenance)
- Events can be linked to venues and automatically mark them as booked
- Deleting or changing events releases venues when appropriate

### 7. Ticketing and Registration
- Multiple ticket types per event (VIP, Standard, etc.)
- Ticket capacity, sale window, and automatic SoldOut/Closed status
- Registration management with attendee details and payment status
- Ticket progress bar segmented by Paid / Pending / Cancelled registrations
- Derived revenue and ticket performance metrics

### 8. Sponsor Management
- Maintain a sponsor list with company type and contact details
- Link sponsors to specific events via sponsorship deals
- Track sponsorship amount or package (Gold/Silver/Bronze/Custom)
- Record benefits such as banners, social media posts, and stage mentions
- Deal status tracking (Proposed, Confirmed, Paid, Cancelled)
- Payment status tracking (Pending, Paid)
- Sponsor history view showing all events sponsored by a sponsor

### 9. Notifications System
- Real-time notification alerts for all events
- Persistent notification storage
- Notification bell with unread count badge
- Mark as read and delete functionality
- Notification polling every 30 seconds

### 10. Calendar View
- Interactive calendar showing all events
- Clickable event cells for navigation
- Month navigation controls
- Event details sidebar
- Today highlight indicator

### 11. Advanced Analytics & Reporting
- Event statistics and trends
- Budget analysis and spending patterns
- Event status distribution charts
- Monthly event timeline
- Budget vs expenses comparison
- Downloadable analytics reports as PDF

## Tech Stack

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** SQLite3
- **Authentication:** JWT + bcryptjs
- **Validation:** Basic form validation
- **CORS:** Enabled for frontend communication

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State Management:** React Context API

## Best Practices Implemented

**Security:**
- Password hashing with bcryptjs
- JWT token validation
- Protected API endpoints
- CORS configuration
- HttpOnly cookies

**Code Quality:**
- TypeScript for type safety
- Modular component structure
- Separation of concerns
- Error handling and validation
- Consistent naming conventions

**UX/UI:**
- Responsive design
- Loading states
- Empty states
- Toast notifications
- Form validation
- Smooth transitions

**Performance:**
- Lazy loading
- Code splitting with React Router
- Optimized database queries
- Efficient re-renders

## Troubleshooting

### Port Already in Use
If ports 5000 or 5173 are already in use:
- Backend: Change `PORT` in `.env`
- Frontend: Update port in `vite.config.ts`

### Database Issues
- Delete `data/events.db` and run `npm run seed` again
- Ensure `data/` directory exists

### CORS Errors
- Ensure backend is running on `http://localhost:5000`
- Update `FRONTEND_URL` in backend if needed

### Login Issues
- Verify database was seeded: `npm run seed`
- Check credentials: admin@example.com / Admin@123
- Clear browser cookies and try again

# Git Workflow Guide

## Creating a New Branch

Create and switch to a new branch:

```bash
git checkout -b develop
```

Push branch to GitHub:

```bash
git push -u origin develop
```

---

## Adding New Changes and Committing

Stage all files:

```bash
git add .
```

Commit changes:

```bash
git commit -m "feat: add ticketing and venue management modules"
```

Push to remote repository:

```bash
git push
```

---

## Conventional Commit Format

This project follows Conventional Commits.

### Commit Types

- feat: New feature
- fix: Bug fix
- refactor: Code improvement
- docs: Documentation update
- style: UI or formatting change
- chore: Maintenance task
- perf: Performance improvement
- test: Testing updates

### Example Commits

```bash
feat: implement ticketing system
fix: resolve venue availability update issue
docs: update README with Git workflow
refactor: optimize budget calculation
```

---

## Example of a Detailed Commit

```bash
git commit

feat: implement ticketing and venue management modules

- Added multiple ticket types per event
- Implemented registration and payment tracking
- Added venue availability management
- Linked events with venues
- Fixed minor validation issues
```

---

## Future Enhancements

- Mobile app with React Native
- Email notifications
- Real-time updates with WebSocket
- File upload for receipts
- Collaborative event planning
- Multi-language support

