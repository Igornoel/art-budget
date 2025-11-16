# Database Setup Instructions

## Important: Update .env file

Before running migrations, please update the `.env` file in `packages/backend/.env` with your actual MySQL credentials:

```env
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/db_artbudget"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
```

Replace:
- `YOUR_USERNAME` with your MySQL username (usually `root`)
- `YOUR_PASSWORD` with your MySQL password

## Steps to Complete Setup:

1. **Create the database** (if not exists):
   ```sql
   CREATE DATABASE db_artbudget;
   ```

2. **Run migrations**:
   ```bash
   cd packages/backend
   npm run prisma:migrate
   ```

3. **Seed superadmin**:
   ```bash
   npm run prisma:seed
   ```

   Superadmin credentials:
   - Email: `admin@artbudget.com`
   - Password: `admin123`
   - Username: `superadmin`

4. **Start backend server**:
   ```bash
   npm run dev
   ```

5. **Start frontend server** (in another terminal):
   ```bash
   cd packages/frontend
   npm run dev
   ```

## Production Deployment

**IMPORTANT**: Before starting the production server, you must run database migrations to create all required tables.

### Option 1: Automatic Migration on Start (Recommended)
The `start` script now automatically runs migrations before starting the server:
```bash
npm run build
npm start
```

### Option 2: Manual Migration
If you prefer to run migrations separately:
```bash
npm run build
npm run prisma:migrate:deploy
npm run start:no-migrate
```

### Production Environment Variables
Make sure your production `.env` file has:
```env
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:3306/YOUR_DATABASE"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=production
```

**Note**: The `prisma migrate deploy` command applies all pending migrations to your production database. This is different from `prisma migrate dev` which is only for development and can create new migrations.

