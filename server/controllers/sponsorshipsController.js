import { sponsorshipsService } from '../services/sponsorshipsService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      console.error('[wrapAsync error]', e);
      sendError(req, res, 'Internal server error', 500, 'INTERNAL_ERROR');
    });
}

export const listSponsors = wrapAsync(async (req, res) => {
  const sponsors = await sponsorshipsService.listActiveSponsors();
  return sendSuccess(res, { sponsors });
});

export const adminListSponsors = wrapAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const { rows, total } = await sponsorshipsService.listSponsors({ page, limit });
  return sendSuccess(res, { sponsors: rows, pagination: { page, limit, total } });
});

export const adminCreateSponsor = wrapAsync(async (req, res) => {
  const created = await sponsorshipsService.createSponsor(req.body);
  return sendSuccess(res, { sponsor: created }, 201);
});

export const adminUpdateSponsor = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid sponsor ID', 400, 'VALIDATION_ERROR');
  const updated = await sponsorshipsService.updateSponsor(id, req.body);
  if (!updated) return sendError(req, res, 'Sponsor not found', 404, 'NOT_FOUND');
  return sendSuccess(res, { sponsor: updated });
});

export const adminDeleteSponsor = wrapAsync(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return sendError(req, res, 'Invalid sponsor ID', 400, 'VALIDATION_ERROR');
  const deleted = await sponsorshipsService.deleteSponsor(id);
  if (!deleted) return sendError(req, res, 'Sponsor not found', 404, 'NOT_FOUND');
  return sendSuccess(res, {});
});
