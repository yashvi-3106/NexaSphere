const eventResourceService = require("../services/eventResourceService");

exports.createResource = (req, res) => {
  try {
    const resource = eventResourceService.createResource(req.body);

    res.status(201).json({
      success: true,
      message: "Resource created successfully.",
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllResources = (req, res) => {
  try {
    const resources = eventResourceService.getAllResources();

    res.json({
      success: true,
      total: resources.length,
      data: resources,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getResourceById = (req, res) => {
  try {
    const resource = eventResourceService.getResourceById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateResource = (req, res) => {
  try {
    const resource = eventResourceService.updateResource(
      req.params.id,
      req.body
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      message: "Resource updated successfully.",
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteResource = (req, res) => {
  try {
    const deleted = eventResourceService.deleteResource(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.reserveResource = (req, res) => {
  try {
    const result = eventResourceService.reserveResource(
      req.params.id,
      req.body.userId,
      req.body.eventId
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.returnResource = (req, res) => {
  try {
    const resource = eventResourceService.returnResource(
      req.params.id,
      req.body.userId
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      message: "Resource returned successfully.",
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.assignResource = (req, res) => {
  try {
    const resource = eventResourceService.assignResource(
      req.params.id,
      req.body.assignedTo
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      message: "Resource assigned successfully.",
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.reportDamage = (req, res) => {
  try {
    const resource = eventResourceService.reportDamage(
      req.params.id,
      req.body.report
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      message: "Damage report submitted.",
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateMaintenanceStatus = (req, res) => {
  try {
    const resource = eventResourceService.updateMaintenanceStatus(
      req.params.id,
      req.body.status
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      message: "Maintenance status updated.",
      data: resource,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.checkAvailability = (req, res) => {
  try {
    const availability = eventResourceService.checkAvailability(
      req.params.id
    );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      data: availability,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.detectConflicts = (req, res) => {
  try {
    const conflicts = eventResourceService.detectConflicts();

    res.json({
      success: true,
      total: conflicts.length,
      data: conflicts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAvailabilityCalendar = (req, res) => {
  try {
    const calendar = eventResourceService.getAvailabilityCalendar();

    res.json({
      success: true,
      data: calendar,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.generateQRCode = (req, res) => {
  try {
    const qr = eventResourceService.generateQRCode(req.params.id);

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.json({
      success: true,
      data: qr,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBorrowHistory = (req, res) => {
  try {
    const history = eventResourceService.getBorrowHistory(req.params.id);

    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getInventoryAnalytics = (req, res) => {
  try {
    const analytics = eventResourceService.getInventoryAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getUtilizationReport = (req, res) => {
  try {
    const report = eventResourceService.getUtilizationReport();

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};