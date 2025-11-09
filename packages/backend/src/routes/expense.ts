import express, { Response } from 'express';
import { PrismaClient, Income, Expense } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const expenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
  category: z.string().optional(),
});

// Get all expenses for user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        expenseId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Add expense
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { description, amount, date, category } = expenseSchema.parse(req.body);

    const expense = await prisma.expense.create({
      data: {
        userId: req.userId!,
        description,
        amount,
        date: new Date(date),
        category: category || null,
      },
    });

    // Update dashboard
    await updateDashboard(req.userId!);

    res.status(201).json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to add expense', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update expense
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { description, amount, date, category } = expenseSchema.partial().parse(req.body);

    const existingExpense = await prisma.expense.findFirst({
      where: {
        expenseId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await prisma.expense.update({
      where: { expenseId: parseInt(req.params.id) },
      data: {
        ...(description && { description }),
        ...(amount && { amount }),
        ...(date && { date: new Date(date) }),
        ...(category !== undefined && { category: category || null }),
      },
    });

    // Update dashboard
    await updateDashboard(req.userId!);

    res.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update expense', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existingExpense = await prisma.expense.findFirst({
      where: {
        expenseId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { expenseId: parseInt(req.params.id) },
    });

    // Update dashboard
    await updateDashboard(req.userId!);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Helper function to update dashboard
async function updateDashboard(userId: number) {
  const incomes = await prisma.income.findMany({
    where: { userId },
  });

  const expenses = await prisma.expense.findMany({
    where: { userId },
  });

  const totalIncome = incomes.reduce((sum: number, income: Income) => sum + Number(income.amount), 0);
  const totalExpense = expenses.reduce((sum: number, expense: Expense) => sum + Number(expense.amount), 0);
  const netBalance = totalIncome - totalExpense;

  await prisma.dashboard.upsert({
    where: { userId },
    update: {
      totalIncome,
      totalExpense,
      netBalance,
    },
    create: {
      userId,
      totalIncome,
      totalExpense,
      netBalance,
    },
  });
}

export default router;