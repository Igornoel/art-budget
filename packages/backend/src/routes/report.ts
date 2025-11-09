import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = express.Router();
const prisma = new PrismaClient();

const reportSchema = z.object({
  reportType: z.enum(['income', 'expense', 'budget', 'summary']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Get all reports for user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.userId! },
      orderBy: { generatedDate: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Generate report
router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reportType, startDate, endDate } = reportSchema.parse(req.body);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate report data
    let reportData: any = {};

    if (reportType === 'income' || reportType === 'summary') {
      const incomes = await prisma.income.findMany({
        where: {
          userId: req.userId!,
          date: {
            gte: start,
            lte: end,
          },
        },
      });
      reportData.incomes = incomes;
    }

    if (reportType === 'expense' || reportType === 'summary') {
      const expenses = await prisma.expense.findMany({
        where: {
          userId: req.userId!,
          date: {
            gte: start,
            lte: end,
          },
        },
      });
      reportData.expenses = expenses;
    }

    if (reportType === 'budget' || reportType === 'summary') {
      const budgets = await prisma.budget.findMany({
        where: { userId: req.userId! },
      });
      reportData.budgets = budgets;
    }

    // Save report record
    const report = await prisma.report.create({
      data: {
        userId: req.userId!,
        reportType,
        startDate: start,
        endDate: end,
      },
    });

    res.json({ report, data: reportData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Export to Excel
router.post('/export/excel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reportType, startDate, endDate } = reportSchema.parse(req.body);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Financial Report');

    if (reportType === 'income' || reportType === 'summary') {
      const incomes = await prisma.income.findMany({
        where: {
          userId: req.userId!,
          date: { gte: start, lte: end },
        },
      });

      worksheet.addRow(['Income Report']);
      worksheet.addRow(['Source', 'Amount', 'Date', 'Category']);
      incomes.forEach((income) => {
        worksheet.addRow([income.source, income.amount.toNumber(), income.date, income.category || '']);
      });
    }

    if (reportType === 'expense' || reportType === 'summary') {
      const expenses = await prisma.expense.findMany({
        where: {
          userId: req.userId!,
          date: { gte: start, lte: end },
        },
      });

      worksheet.addRow([]);
      worksheet.addRow(['Expense Report']);
      worksheet.addRow(['Description', 'Amount', 'Date', 'Category']);
      expenses.forEach((expense) => {
        worksheet.addRow([expense.description, expense.amount.toNumber(), expense.date, expense.category || '']);
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to export report', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Export to PDF
router.post('/export/pdf', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reportType, startDate, endDate } = reportSchema.parse(req.body);

    const start = new Date(startDate);
    const end = new Date(endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();

    if (reportType === 'income' || reportType === 'summary') {
      const incomes = await prisma.income.findMany({
        where: {
          userId: req.userId!,
          date: { gte: start, lte: end },
        },
      });

      doc.fontSize(16).text('Income Report');
      doc.moveDown();
      incomes.forEach((income) => {
        doc.fontSize(12).text(
          `${income.source}: RWF ${income.amount.toNumber()} - ${new Date(income.date).toLocaleDateString()}`
        );
      });
      doc.moveDown();
    }

    if (reportType === 'expense' || reportType === 'summary') {
      const expenses = await prisma.expense.findMany({
        where: {
          userId: req.userId!,
          date: { gte: start, lte: end },
        },
      });

      doc.fontSize(16).text('Expense Report');
      doc.moveDown();
      expenses.forEach((expense) => {
        doc.fontSize(12).text(
          `${expense.description}: RWF ${expense.amount.toNumber()} - ${new Date(expense.date).toLocaleDateString()}`
        );
      });
    }

    doc.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export report', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;