import mediaManagementService from "../services/mediaManagementService.js";

export const getFiles = (req, res) => {
  res.json({
    success: true,
    data: mediaManagementService.getAllFiles(),
  });
};

export const getFile = (req, res) => {
  const file = mediaManagementService.getFileById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.json({
    success: true,
    data: file,
  });
};

export const uploadFile = (req, res) => {
  const file = mediaManagementService.uploadFile(req.body);

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
};

export const deleteFile = (req, res) => {
  const deleted = mediaManagementService.deleteFile(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.json({
    success: true,
    message: "File deleted successfully",
    data: deleted,
  });
};

export const searchFiles = (req, res) => {
  const files = mediaManagementService.searchFiles(req.query.q || "");

  res.json({
    success: true,
    data: files,
  });
};

export const updateTags = (req, res) => {
  const file = mediaManagementService.updateTags(
    req.params.id,
    req.body.tags
  );

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.json({
    success: true,
    data: file,
  });
};

export const moveFile = (req, res) => {
  const file = mediaManagementService.moveFile(
    req.params.id,
    req.body.folder
  );

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.json({
    success: true,
    data: file,
  });
};

export const optimizeImage = (req, res) => {
  const file = mediaManagementService.optimizeImage(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  res.json({
    success: true,
    message: "Image optimized",
    data: file,
  });
};

export const getStorageUsage = (req, res) => {
  res.json({
    success: true,
    data: mediaManagementService.getStorageUsage(),
  });
};

export const getStatistics = (req, res) => {
  res.json({
    success: true,
    data: mediaManagementService.getStatistics(),
  });
};