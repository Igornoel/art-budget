# ART BUDGET - Personal Finance Management System

A full-stack personal finance management application built with React, TypeScript, Node.js, Express, and Prisma.

## Features

- **User Authentication**: Register and login with JWT authentication
- **Income Management**: Add, edit, and delete income records
- **Expense Management**: Add, edit, and delete expense records
- **Budget Management**: Create and track budgets by category
- **Financial Dashboard**: View comprehensive financial summaries with charts
- **Reports**: Generate financial reports with export to Excel and PDF
- **Help & Tutorials**: Access help documentation and FAQs
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- React Router
- Ant Design
- Tailwind CSS
- Sonner (Toast notifications)
- Recharts (Charts)
- Axios

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- ExcelJS (Excel export)
- PDFKit (PDF export)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database named `db_artbudget`:

```sql
CREATE DATABASE db_artbudget;
```

### 2. Backend Setup

```bash
cd packages/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials:
# DATABASE_URL="postgresql://user:password@localhost:5432/db_artbudget?schema=public"
# JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
# PORT=3001

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd packages/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend application will be available at `http://localhost:3000`

## Project Structure

```
art-budget/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Authentication middleware
│   │   │   └── index.ts       # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── contexts/      # React contexts
│       │   ├── utils/         # Utility functions
│       │   └── App.tsx        # Main app
│       └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Income
- `GET /api/income` - Get all incomes
- `POST /api/income` - Add income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Expense
- `GET /api/expense` - Get all expenses
- `POST /api/expense` - Add expense
- `PUT /api/expense/:id` - Update expense
- `DELETE /api/expense/:id` - Delete expense

### Budget
- `GET /api/budget` - Get all budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update budget
- `DELETE /api/budget/:id` - Delete budget

### Reports
- `POST /api/report/generate` - Generate report
- `POST /api/report/export/excel` - Export to Excel
- `POST /api/report/export/pdf` - Export to PDF

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `POST /api/dashboard/refresh` - Refresh dashboard

## Usage

1. Start the backend server (port 3001)
2. Start the frontend server (port 3000)
3. Open `http://localhost:3000` in your browser
4. Register a new account or login
5. Start managing your finances!

## Development

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Database Schema

The application uses the following main models:
- **User**: User accounts
- **Income**: Income records
- **Expense**: Expense records
- **Budget**: Budget goals
- **Report**: Generated reports
- **Dashboard**: Dashboard summary data

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and included in API requests via the Authorization header.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
