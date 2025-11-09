import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const budgetSchema = z.object({
  category: z.string().min(1),
  plannedAmount: z.number().positive(),
  period: z.enum(['weekly', 'monthly', 'yearly']),
});

// Get all budgets for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate actual amounts from expenses
    const budgetsWithActual = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await prisma.expense.findMany({
          where: {
            userId: req.userId!,
            category: budget.category,
          },
        });

        const actualAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

        return {
          ...budget,
          actualAmount,
        };
      })
    );

    res.json(budgetsWithActual);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Get budget by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        budgetId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Calculate actual amount
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId!,
        category: budget.category,
      },
    });

    const actualAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    res.json({ ...budget, actualAmount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Create budget
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { category, plannedAmount, period } = budgetSchema.parse(req.body);

    const budget = await prisma.budget.create({
      data: {
        userId: req.userId!,
        category,
        plannedAmount,
        period,
        actualAmount: 0,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Update budget
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { category, plannedAmount, period } = budgetSchema.partial().parse(req.body);

    const existingBudget = await prisma.budget.findFirst({
      where: {
        budgetId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const budget = await prisma.budget.update({
      where: { budgetId: parseInt(req.params.id) },
      data: {
        ...(category && { category }),
        ...(plannedAmount && { plannedAmount }),
        ...(period && { period }),
      },
    });

    res.json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete budget
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const existingBudget = await prisma.budget.findFirst({
      where: {
        budgetId: parseInt(req.params.id),
        userId: req.userId!,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await prisma.budget.delete({
      where: { budgetId: parseInt(req.params.id) },
    });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;