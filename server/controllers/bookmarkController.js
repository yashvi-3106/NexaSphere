import bookmarkService from '../services/bookmarkService.js';

export const createBookmark = (req, res) => {
  res.status(201).json(bookmarkService.createBookmark(req.body));
};

export const getBookmarks = (req, res) => {
  res.json(bookmarkService.getBookmarks());
};

export const deleteBookmark = (req, res) => {
  res.json(bookmarkService.deleteBookmark(req.params.id));
};

export const searchBookmarks = (req, res) => {
  res.json(bookmarkService.searchBookmarks(req.query.q || ''));
};

export const getRecentBookmarks = (req, res) => {
  res.json(bookmarkService.getRecentBookmarks());
};

export const createFolder = (req, res) => {
  res.status(201).json(bookmarkService.createFolder(req.body.name));
};

export const getFolders = (req, res) => {
  res.json(bookmarkService.getFolders());
};

export const updateFolder = (req, res) => {
  res.json(bookmarkService.updateFolder(req.params.id, req.body.name));
};

export const deleteFolder = (req, res) => {
  res.json(bookmarkService.deleteFolder(req.params.id));
};

export const shareCollection = (req, res) => {
  res.json(bookmarkService.shareCollection(req.params.id));
};

export const syncBookmarks = (req, res) => {
  res.json(bookmarkService.syncBookmarks());
};

export const exportBookmarks = (req, res) => {
  res.json(bookmarkService.exportBookmarks());
};

export const getBookmarkAnalytics = (req, res) => {
  res.json(bookmarkService.getBookmarkAnalytics());
};
