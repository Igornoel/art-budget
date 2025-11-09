import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const incomeSchema = z.object({
  source: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
  category: z.string().optional(),
});

// Get all incomes for user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
    });

    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// Get income by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const income = await prisma.income.findFirst({
      where: {
        incomeId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

// Add income
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { source, amount, date, category } = incomeSchema.parse(req.body);

    const income = await prisma.income.create({
      data: {
        userId: req.userId!,
        source,
        amount,
        date: new Date(date),
        category: category || null,
      },
    });

    // Update dashboard
    await updateDashboard(req.userId!);

    res.status(201).json(income);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to add income', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update income
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { source, amount, date, category } = incomeSchema.partial().parse(req.body);

    const existingIncome = await prisma.income.findFirst({
      where: {
        incomeId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income not found' });
    }

    const income = await prisma.income.update({
      where: { incomeId: parseInt(req.params.id) },
      data: {
        ...(source && { source }),
        ...(amount && { amount }),
        ...(date && { date: new Date(date) }),
        ...(category !== undefined && { category: category || null }),
      },
    });

    // Update dashboard
    await updateDashboard(req.userId!);

    res.json(income);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update income', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete income
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existingIncome = await prisma.income.findFirst({
      where: {
        incomeId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income not found' });
    }

    await prisma.income.delete({
      where: { incomeId: parseInt(req.params.id) },
    });

    // Update dashboard
    await updateDashboard(req.userId!);

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete income' });
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

  const totalIncome = incomes.reduce((sum: number, income) => sum + Number(income.amount), 0);
  const totalExpense = expenses.reduce((sum: number, expense) => sum + Number(expense.amount), 0);
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