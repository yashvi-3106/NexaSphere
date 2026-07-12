const budgetService = require("../services/budgetService");

// Get All Budgets
const getAllBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.getAllBudgets();

    res.status(200).json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets.",
      error: error.message,
    });
  }
};

// Get Budget By ID
const getBudgetById = async (req, res) => {
  try {
    const budget = await budgetService.getBudgetById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget.",
      error: error.message,
    });
  }
};

// Create Budget
const createBudget = async (req, res) => {
  try {
    const budget = await budgetService.createBudget(req.body);

    res.status(201).json({
      success: true,
      message: "Budget created successfully.",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create budget.",
      error: error.message,
    });
  }
};

// Update Budget
const updateBudget = async (req, res) => {
  try {
    const budget = await budgetService.updateBudget(req.params.id, req.body);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully.",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update budget.",
      error: error.message,
    });
  }
};

// Delete Budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await budgetService.deleteBudget(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully.",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete budget.",
      error: error.message,
    });
  }
};

// Add Expense
const addExpense = async (req, res) => {
  try {
    const expense = await budgetService.addExpense(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: "Expense added successfully.",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add expense.",
      error: error.message,
    });
  }
};

// Get Expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await budgetService.getExpenses(req.params.id);

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses.",
      error: error.message,
    });
  }
};

// Upload Invoice
const uploadInvoice = async (req, res) => {
  try {
    const invoice = await budgetService.uploadInvoice(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: "Invoice uploaded successfully.",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload invoice.",
      error: error.message,
    });
  }
};

// Approve Expense
const approveExpense = async (req, res) => {
  try {
    const approval = await budgetService.approveExpense(req.params.id);

    res.status(200).json({
      success: true,
      message: "Expense approved successfully.",
      data: approval,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve expense.",
      error: error.message,
    });
  }
};

// Remaining Budget
const getRemainingBudget = async (req, res) => {
  try {
    const remaining = await budgetService.getRemainingBudget(req.params.id);

    res.status(200).json({
      success: true,
      data: remaining,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate remaining budget.",
      error: error.message,
    });
  }
};

// Category-wise Spending
const getCategorySpending = async (req, res) => {
  try {
    const spending = await budgetService.getCategorySpending(req.params.id);

    res.status(200).json({
      success: true,
      data: spending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category spending.",
      error: error.message,
    });
  }
};

// Vendors
const getVendors = async (req, res) => {
  try {
    const vendors = await budgetService.getVendors();

    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors.",
      error: error.message,
    });
  }
};

const addVendor = async (req, res) => {
  try {
    const vendor = await budgetService.addVendor(req.body);

    res.status(201).json({
      success: true,
      message: "Vendor added successfully.",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add vendor.",
      error: error.message,
    });
  }
};

// Financial Reports
const getFinancialReports = async (req, res) => {
  try {
    const reports = await budgetService.getFinancialReports();

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial reports.",
      error: error.message,
    });
  }
};

// Budget Alerts
const getBudgetAlerts = async (req, res) => {
  try {
    const alerts = await budgetService.getBudgetAlerts();

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget alerts.",
      error: error.message,
    });
  }
};

// Export Statements
const exportStatements = async (req, res) => {
  try {
    const statement = await budgetService.exportStatements();

    res.status(200).json({
      success: true,
      data: statement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to export statements.",
      error: error.message,
    });
  }
};

// Budget History
const getBudgetHistory = async (req, res) => {
  try {
    const history = await budgetService.getBudgetHistory();

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget history.",
      error: error.message,
    });
  }
};

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