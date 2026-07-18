import bookmarkService from '../services/bookmarkService.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const createBookmark = (req, res) => {
  sendSuccess(res, bookmarkService.createBookmark(req.body), 201);
};

export const getBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.getBookmarks());
};

export const deleteBookmark = (req, res) => {
  sendSuccess(res, bookmarkService.deleteBookmark(req.params.id));
};

export const searchBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.searchBookmarks(req.query.q || ''));
};

export const getRecentBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.getRecentBookmarks());
};

export const createFolder = (req, res) => {
  sendSuccess(res, bookmarkService.createFolder(req.body.name), 201);
};

export const getFolders = (req, res) => {
  sendSuccess(res, bookmarkService.getFolders());
};

export const updateFolder = (req, res) => {
  sendSuccess(res, bookmarkService.updateFolder(req.params.id, req.body.name));
};

export const deleteFolder = (req, res) => {
  sendSuccess(res, bookmarkService.deleteFolder(req.params.id));
};

export const shareCollection = (req, res) => {
  sendSuccess(res, bookmarkService.shareCollection(req.params.id));
};

export const syncBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.syncBookmarks());
};

export const exportBookmarks = (req, res) => {
  sendSuccess(res, bookmarkService.exportBookmarks());
};

export const getBookmarkAnalytics = (req, res) => {
  sendSuccess(res, bookmarkService.getBookmarkAnalytics());
};
