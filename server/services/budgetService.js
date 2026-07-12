/**
 * Budget Management Service
 * Mock implementation for Intelligent Event Budget Planning & Expense Management
 */

const budgets = [
  {
    id: 1,
    event: "Tech Fest 2026",
    totalBudget: 100000,
    spent: 25000,
    remaining: 75000,
    createdAt: new Date().toISOString(),
  },
];

const expenses = [];

const vendors = [
  {
    id: 1,
    name: "ABC Printers",
    category: "Printing",
  },
];

const reports = [];

const alerts = [];

const history = [];

// Get All Budgets
const getAllBudgets = async () => budgets;

// Get Budget By ID
const getBudgetById = async (id) =>
  budgets.find((budget) => budget.id === Number(id));

// Create Budget
const createBudget = async (data) => {
  const budget = {
    id: budgets.length + 1,
    spent: 0,
    remaining: data.totalBudget,
    createdAt: new Date().toISOString(),
    ...data,
  };

  budgets.push(budget);
  return budget;
};

// Update Budget
const updateBudget = async (id, data) => {
  const index = budgets.findIndex(
    (budget) => budget.id === Number(id)
  );

  if (index === -1) return null;

  budgets[index] = {
    ...budgets[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return budgets[index];
};

// Delete Budget
const deleteBudget = async (id) => {
  const index = budgets.findIndex(
    (budget) => budget.id === Number(id)
  );

  if (index === -1) return null;

  return budgets.splice(index, 1)[0];
};

// Add Expense
const addExpense = async (budgetId, data) => {
  const expense = {
    id: expenses.length + 1,
    budgetId: Number(budgetId),
    createdAt: new Date().toISOString(),
    status: "Pending",
    ...data,
  };

  expenses.push(expense);

  const budget = budgets.find(
    (item) => item.id === Number(budgetId)
  );

  if (budget) {
    budget.spent += Number(data.amount || 0);
    budget.remaining = budget.totalBudget - budget.spent;
  }

  return expense;
};

// Get Expenses
const getExpenses = async (budgetId) =>
  expenses.filter(
    (expense) => expense.budgetId === Number(budgetId)
  );

// Upload Invoice
const uploadInvoice = async (budgetId, data) => ({
  budgetId: Number(budgetId),
  invoiceName: data.invoiceName,
  invoiceUrl: data.invoiceUrl,
  uploadedAt: new Date().toISOString(),
});

// Approve Expense
const approveExpense = async (budgetId) => ({
  budgetId: Number(budgetId),
  approved: true,
  approvedAt: new Date().toISOString(),
});

// Remaining Budget
const getRemainingBudget = async (budgetId) => {
  const budget = budgets.find(
    (item) => item.id === Number(budgetId)
  );

  return budget
    ? {
        totalBudget: budget.totalBudget,
        spent: budget.spent,
        remaining: budget.remaining,
      }
    : null;
};

// Category-wise Spending
const getCategorySpending = async (budgetId) => {
  const budgetExpenses = expenses.filter(
    (expense) => expense.budgetId === Number(budgetId)
  );

  const categories = {};

  budgetExpenses.forEach((expense) => {
    categories[expense.category] =
      (categories[expense.category] || 0) +
      Number(expense.amount || 0);
  });

  return categories;
};

// Vendors
const getVendors = async () => vendors;

const addVendor = async (data) => {
  const vendor = {
    id: vendors.length + 1,
    ...data,
  };

  vendors.push(vendor);
  return vendor;
};

// Financial Reports
const getFinancialReports = async () => reports;

// Budget Alerts
const getBudgetAlerts = async () => alerts;

// Export Statements
const exportStatements = async () => ({
  format: "PDF",
  generatedAt: new Date().toISOString(),
  downloadUrl: "/exports/budget-report.pdf",
});

// Budget History
const getBudgetHistory = async () => history;

module.exports = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  addExpense,
  getExpenses,
  uploadInvoice,
  approveExpense,
  getRemainingBudget,
  getCategorySpending,
  getVendors,
  addVendor,
  getFinancialReports,
  getBudgetAlerts,
  exportStatements,
  getBudgetHistory,
};