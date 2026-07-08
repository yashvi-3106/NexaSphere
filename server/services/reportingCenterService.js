/**
 * Reporting Center Service
 * Mock implementation for Platform-Wide Data Export & Reporting Center
 */

const reports = [
  {
    id: 1,
    name: "Event Registration Report",
    type: "CSV",
    status: "Completed",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Attendance Analytics",
    type: "PDF",
    status: "Completed",
    createdAt: new Date().toISOString(),
  },
];

const templates = [
  {
    id: 1,
    name: "Monthly Event Summary",
    filters: {
      module: "events",
      format: "PDF",
    },
  },
];

const reportHistory = [];

const auditLogs = [];

const dashboardSummary = {
  totalReports: 25,
  scheduledReports: 6,
  exportedToday: 8,
  totalDownloads: 134,
};

// Get All Reports
const getReports = async () => reports;

// Export Data
const exportData = async (data) => {
  const report = {
    id: reports.length + 1,
    name: data.name || "Custom Export",
    type: data.format || "CSV",
    status: "Completed",
    exportedAt: new Date().toISOString(),
  };

  reports.push(report);
  reportHistory.push(report);

  auditLogs.push({
    action: "Export Generated",
    report: report.name,
    timestamp: new Date().toISOString(),
  });

  return report;
};

// Schedule Report
const scheduleReport = async (data) => ({
  id: Date.now(),
  schedule: data.schedule,
  format: data.format,
  status: "Scheduled",
});

// Generate Custom Report
const generateCustomReport = async (data) => ({
  id: Date.now(),
  title: data.title || "Custom Report",
  filters: data.filters || {},
  generatedAt: new Date().toISOString(),
});

// Save Template
const saveTemplate = async (data) => {
  const template = {
    id: templates.length + 1,
    ...data,
  };

  templates.push(template);

  return template;
};

// Get Templates
const getTemplates = async () => templates;

// Email Report
const emailReport = async (data) => ({
  email: data.email,
  report: data.report,
  status: "Sent",
  sentAt: new Date().toISOString(),
});

// Dashboard Summary
const getDashboardSummary = async () => dashboardSummary;

// Report History
const getReportHistory = async () => reportHistory;

// Audit Logs
const getAuditLogs = async () => auditLogs;

// Filter Reports
const filterReports = async (filters) => {
  let filtered = [...reports];

  if (filters.type) {
    filtered = filtered.filter(
      (report) =>
        report.type.toLowerCase() === filters.type.toLowerCase()
    );
  }

  if (filters.status) {
    filtered = filtered.filter(
      (report) =>
        report.status.toLowerCase() === filters.status.toLowerCase()
    );
  }

  return filtered;
};

// Export Permissions
const getPermissions = async () => ({
  admin: true,
  organizer: true,
  faculty: false,
  student: false,
});

module.exports = {
  getReports,
  exportData,
  scheduleReport,
  generateCustomReport,
  saveTemplate,
  getTemplates,
  emailReport,
  getDashboardSummary,
  getReportHistory,
  getAuditLogs,
  filterReports,
  getPermissions,
};