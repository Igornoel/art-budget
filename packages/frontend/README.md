# ART BUDGET Frontend

Frontend application for the ART BUDGET personal finance management system.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Ant Design
- Tailwind CSS
- Sonner (Toast notifications)
- Recharts (Charts)
- Axios
- Day.js

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- **Authentication**: Register and login pages
- **Dashboard**: Financial overview with charts and summaries
- **Income Management**: Add, edit, delete income records
- **Expense Management**: Add, edit, delete expense records
- **Budget Management**: Create and track budgets
- **Reports**: Generate and export financial reports
- **Help**: Tutorials and FAQ section
- **Responsive Design**: Works on desktop, tablet, and mobile

## Project Structure

```
src/
├── components/     # Reusable components
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── contexts/      # React contexts
│   └── AuthContext.tsx
├── pages/         # Page components
│   ├── Dashboard.tsx
│   ├── Income.tsx
│   ├── Expense.tsx
│   ├── Budget.tsx
│   ├── Reports.tsx
│   ├── Help.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── utils/         # Utility functions
│   └── api.ts
├── App.tsx        # Main app component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## Development

- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint`

## API Integration

The frontend communicates with the backend API at `http://localhost:3001`. The API base URL is configured in `vite.config.ts` with a proxy.

## Authentication

User authentication is handled through JWT tokens stored in localStorage. The `AuthContext` manages authentication state and provides login/logout functions.

## Styling

- **Ant Design**: UI components and layout
- **Tailwind CSS**: Utility-first CSS for custom styling
- **Responsive**: Mobile-first design approach
