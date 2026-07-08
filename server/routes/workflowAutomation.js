const express = require("express");
const router = express.Router();

const controller = require("../controllers/workflowAutomationController");

// Workflow CRUD
router.get(
  "/workflows",
  controller.getAllWorkflows
);

router.get(
  "/workflows/:id",
  controller.getWorkflowById
);

router.post(
  "/workflows",
  controller.createWorkflow
);

router.put(
  "/workflows/:id",
  controller.updateWorkflow
);

router.delete(
  "/workflows/:id",
  controller.deleteWorkflow
);

// Workflow Requests
router.post(
  "/requests",
  controller.submitRequest
);

router.put(
  "/requests/:id/approve",
  controller.approveRequest
);

router.put(
  "/requests/:id/reject",
  controller.rejectRequest
);

router.post(
  "/requests/bulk-approve",
  controller.bulkApprove
);

router.get(
  "/requests/pending",
  controller.getPendingRequests
);

// History & Templates
router.get(
  "/history",
  controller.getApprovalHistory
);

router.get(
  "/templates",
  controller.getWorkflowTemplates
);

// Analytics
router.get(
  "/analytics",
  controller.getWorkflowAnalytics
);

// Escalation
router.post(
  "/escalate",
  controller.escalatePendingRequests
);

// Audit Logs
router.get(
  "/audit-logs",
  controller.getAuditLogs
);

module.exports = router;