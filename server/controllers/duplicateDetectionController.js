const duplicateService = require("../services/duplicateDetectionService");

exports.getOverview = (req, res) => {
  res.status(200).json(duplicateService.getOverview());
};

exports.checkRecord = (req, res) => {
  res.status(200).json(
    duplicateService.checkRecord(req.body)
  );
};

exports.getDuplicateEvents = (req, res) => {
  res.status(200).json(
    duplicateService.detectDuplicateEvents()
  );
};

exports.getDuplicateMedia = (req, res) => {
  res.status(200).json(
    duplicateService.detectDuplicateMedia()
  );
};

exports.getPortfolioDuplicates = (req, res) => {
  res.status(200).json(
    duplicateService.detectPortfolioDuplicates()
  );
};

exports.getClubDuplicates = (req, res) => {
  res.status(200).json(
    duplicateService.detectClubDuplicates()
  );
};

exports.mergeDuplicates = (req, res) => {
  const { id1, id2 } = req.body;

  res.status(200).json(
    duplicateService.mergeDuplicates(id1, id2)
  );
};

exports.deleteDuplicate = (req, res) => {
  res.status(200).json(
    duplicateService.deleteDuplicate(req.params.id)
  );
};

exports.getStatistics = (req, res) => {
  res.status(200).json(
    duplicateService.getStatistics()
  );
};