import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import incomeRoutes from './routes/income';
import expenseRoutes from './routes/expense';
import budgetRoutes from './routes/budget';
import reportRoutes from './routes/report';
import dashboardRoutes from './routes/dashboard';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', async (req: express.Request, res: express.Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'ART BUDGET API is running',
      database: 'connected'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ 
      status: 'error', 
      message: 'ART BUDGET API is running but database connection failed',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check your DATABASE_URL environment variable');
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});