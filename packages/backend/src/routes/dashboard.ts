import express, { Response } from 'express';
import { PrismaClient, Income, Expense } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard data
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Get or create dashboard
    let dashboard = await prisma.dashboard.findUnique({
      where: { userId: req.userId! },
    });

    if (!dashboard) {
      dashboard = await prisma.dashboard.create({
        data: {
          userId: req.userId!,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
        },
      });
    }

    // Get recent transactions (last 10)
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId! },
      take: 5,
      orderBy: { date: 'desc' },
    });

    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId! },
      take: 5,
      orderBy: { date: 'desc' },
    });

    // Get budgets
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId! },
    });

    // Calculate category-wise expenses
    const categoryExpenses = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId: req.userId! },
      _sum: {
        amount: true,
      },
    });

    // Calculate income by category
    const categoryIncome = await prisma.income.groupBy({
      by: ['category'],
      where: { userId: req.userId! },
      _sum: {
        amount: true,
      },
    });

    // Get cash flow data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cashFlowData = await prisma.income.findMany({
      where: {
        userId: req.userId!,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    const cashFlowExpenses = await prisma.expense.findMany({
      where: {
        userId: req.userId!,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    res.json({
      dashboard,
      recentIncomes: incomes,
      recentExpenses: expenses,
      budgets,
      categoryExpenses,
      categoryIncome,
      cashFlowData: {
        incomes: cashFlowData,
        expenses: cashFlowExpenses,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Refresh dashboard (recalculate)
router.post('/refresh', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId! },
    });

    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId! },
    });

    const totalIncome = incomes.reduce((sum: number, income: Income) => sum + Number(income.amount), 0);
    const totalExpense = expenses.reduce((sum: number, expense: Expense) => sum + Number(expense.amount), 0);
    const netBalance = totalIncome - totalExpense;

    const dashboard = await prisma.dashboard.upsert({
      where: { userId: req.userId! },
      update: {
        totalIncome,
        totalExpense,
        netBalance,
      },
      create: {
        userId: req.userId!,
        totalIncome,
        totalExpense,
        netBalance,
      },
    });

    res.json({ message: 'Dashboard refreshed', dashboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh dashboard' });
  }
});

export default router;