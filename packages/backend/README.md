# ART BUDGET Backend

Backend API for the ART BUDGET personal finance management system.

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_artbudget?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
```

3. Initialize the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Income
- `GET /api/income` - Get all incomes
- `GET /api/income/:id` - Get income by ID
- `POST /api/income` - Add income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Expense
- `GET /api/expense` - Get all expenses
- `GET /api/expense/:id` - Get expense by ID
- `POST /api/expense` - Add expense
- `PUT /api/expense/:id` - Update expense
- `DELETE /api/expense/:id` - Delete expense

### Budget
- `GET /api/budget` - Get all budgets
- `GET /api/budget/:id` - Get budget by ID
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update budget
- `DELETE /api/budget/:id` - Delete budget

### Reports
- `GET /api/report` - Get all reports
- `POST /api/report/generate` - Generate report
- `POST /api/report/export/excel` - Export to Excel
- `POST /api/report/export/pdf` - Export to PDF

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `POST /api/dashboard/refresh` - Refresh dashboard

## Database Schema

The database schema is defined in `prisma/schema.prisma`. The main models are:

- User: User accounts
- Income: Income records
- Expense: Expense records
- Budget: Budget goals
- Report: Generated reports
- Dashboard: Dashboard summary data

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Development

- Run in development mode: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Open Prisma Studio: `npm run prisma:studio`
