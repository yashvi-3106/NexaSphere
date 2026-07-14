const draftService = require("../services/draftRecoveryService");

exports.createDraft = (req, res) => {
  try {
    const { userId } = req.params;
    const { module, title, content } = req.body;

    const draft = draftService.createDraft(
      userId,
      module,
      title,
      content
    );

    res.status(201).json({
      success: true,
      message: "Draft created successfully",
      draft,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getDraft = (req, res) => {
  const draft = draftService.getDraft(req.params.draftId);

  if (!draft) {
    return res.status(404).json({
      success: false,
      message: "Draft not found",
    });
  }

  res.json({
    success: true,
    draft,
  });
};

exports.listDrafts = (req, res) => {
  const drafts = draftService.listDrafts(req.params.userId);

  res.json({
    success: true,
    drafts,
  });
};

exports.updateDraft = (req, res) => {
  const draft = draftService.updateDraft(
    req.params.draftId,
    req.body.content
  );

  if (!draft) {
    return res.status(404).json({
      success: false,
      message: "Draft not found",
    });
  }

  res.json({
    success: true,
    message: "Draft auto-saved",
    draft,
  });
};

exports.deleteDraft = (req, res) => {
  const deleted = draftService.deleteDraft(req.params.draftId);

  res.json({
    success: deleted,
  });
};

exports.restoreDraft = (req, res) => {
  const version = draftService.restoreDraft(req.params.draftId);

  res.json({
    success: true,
    version,
  });
};

exports.versionHistory = (req, res) => {
  res.json({
    success: true,
    versions: draftService.versionHistory(req.params.draftId),
  });
};

exports.syncDraft = (req, res) => {
  res.json({
    success: true,
    draft: draftService.syncDraft(req.params.draftId),
  });
};

exports.statistics = (req, res) => {
  res.json({
    success: true,
    statistics: draftService.getStatistics(),
  });
};