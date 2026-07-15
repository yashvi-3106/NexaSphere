const bookmarkService = require("../services/bookmarkService");
const { sendSuccess } = require("../utils/responseHelper");

exports.createBookmark = (req, res) => {
  sendSuccess(res, bookmarkService.createBookmark(req.body), 201);
};

exports.getBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.getBookmarks());
};

exports.deleteBookmark = (req, res) => {
  sendSuccess(res, bookmarkService.deleteBookmark(req.params.id));
};

exports.searchBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.searchBookmarks(req.query.q || ""));
};

exports.getRecentBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.getRecentBookmarks());
};

exports.createFolder = (req, res) => {
  sendSuccess(res, bookmarkService.createFolder(req.body.name), 201);
};

exports.getFolders = (req, res) => {
  sendSuccess(res, bookmarkService.getFolders());
};

exports.updateFolder = (req, res) => {
  sendSuccess(res, bookmarkService.updateFolder(
    req.params.id,
    req.body.name
  ));
};

exports.deleteFolder = (req, res) => {
  sendSuccess(res, bookmarkService.deleteFolder(req.params.id));
};

exports.shareCollection = (req, res) => {
  sendSuccess(res, bookmarkService.shareCollection(req.params.id));
};

exports.syncBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.syncBookmarks());
};

exports.exportBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.exportBookmarks());
};

exports.getBookmarkAnalytics = (req, res) => {
  sendSuccess(res, bookmarkService.getBookmarkAnalytics());
};