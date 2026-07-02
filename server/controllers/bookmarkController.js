const bookmarkService = require("../services/bookmarkService");

exports.createBookmark = (req, res) => {
  res.status(201).json(
    bookmarkService.createBookmark(req.body)
  );
};

exports.getBookmarks = (req, res) => {
  res.json(
    bookmarkService.getBookmarks()
  );
};

exports.deleteBookmark = (req, res) => {
  res.json(
    bookmarkService.deleteBookmark(req.params.id)
  );
};

exports.searchBookmarks = (req, res) => {
  res.json(
    bookmarkService.searchBookmarks(req.query.q || "")
  );
};

exports.getRecentBookmarks = (req, res) => {
  res.json(
    bookmarkService.getRecentBookmarks()
  );
};

exports.createFolder = (req, res) => {
  res.status(201).json(
    bookmarkService.createFolder(req.body.name)
  );
};

exports.getFolders = (req, res) => {
  res.json(
    bookmarkService.getFolders()
  );
};

exports.updateFolder = (req, res) => {
  res.json(
    bookmarkService.updateFolder(
      req.params.id,
      req.body.name
    )
  );
};

exports.deleteFolder = (req, res) => {
  res.json(
    bookmarkService.deleteFolder(req.params.id)
  );
};

exports.shareCollection = (req, res) => {
  res.json(
    bookmarkService.shareCollection(req.params.id)
  );
};

exports.syncBookmarks = (req, res) => {
  res.json(
    bookmarkService.syncBookmarks()
  );
};

exports.exportBookmarks = (req, res) => {
  res.json(
    bookmarkService.exportBookmarks()
  );
};

exports.getBookmarkAnalytics = (req, res) => {
  res.json(
    bookmarkService.getBookmarkAnalytics()
  );
};