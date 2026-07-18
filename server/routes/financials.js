import { Router } from 'express';
import { requireStudentAuth } from '../middleware/studentAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import * as financialController from '../controllers/financialController.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  cloneBudgetSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createRevenueSchema,
} from '../validators/routes/financialsSchemas.js';

const router = Router();

// Secure all financial routes with student auth
router.use(requireStudentAuth);

// Budgets
router.post('/budgets', validate(createBudgetSchema), financialController.createBudget);
router.get('/budgets', financialController.getBudgets);
router.get('/budgets/:id', financialController.getBudgetById);
router.put('/budgets/:id', validate(updateBudgetSchema), financialController.updateBudget);
router.delete('/budgets/:id', financialController.deleteBudget);
router.post('/budgets/:id/clone', validate(cloneBudgetSchema), financialController.cloneBudget);

// Expenses
router.post('/expenses', validate(createExpenseSchema), financialController.createExpense);
router.get('/expenses', financialController.getExpenses);
router.put('/expenses/:id', validate(updateExpenseSchema), financialController.updateExpense);
router.delete('/expenses/:id', financialController.deleteExpense);

// Revenue
router.post('/revenues', validate(createRevenueSchema), financialController.createRevenue);
router.get('/revenues', financialController.getRevenues);
router.delete('/revenues/:id', financialController.deleteRevenue);

// Reports & Calculations
router.get('/budgets/:id/variance', financialController.getBudgetVariance);
router.get('/budgets/:id/income-statement', financialController.getIncomeStatement);
router.get('/budgets-utilization', financialController.getBudgetsUtilizationReport);
router.get('/budgets/:id/export', financialController.exportReport);
router.get('/reports/revenue', financialController.getRevenueReport);

export default router;
