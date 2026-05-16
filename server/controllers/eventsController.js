import { eventsService } from '../services/eventsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const listEvents = wrapAsync(async (req, res) => {
  const events = await eventsService.listEvents();
  return res.json({ events });
});

export const adminListEvents = wrapAsync(async (req, res) => {
  const events = await eventsService.listEvents();
  return res.json({ events });
});

export const adminCreateEvent = wrapAsync(async (req, res) => {
  const created = await eventsService.createEvent(req.body || {});
  return res.status(201).json({ ok: true, event: created });
});

export const adminUpdateEvent = wrapAsync(async (req, res) => {
  const id = String(req.params.id || '').trim();
  const updated = await eventsService.updateEvent(id, req.body);
  if (!updated) throw new NotFoundError('Event not found');
  return res.json({ ok: true, event: updated });
});

export const adminDeleteEvent = wrapAsync(async (req, res) => {
  const id = String(req.params.id || '').trim();
  const deleted = await eventsService.deleteEvent(id);
  if (!deleted) throw new NotFoundError('Event not found');
  return res.json({ ok: true });
});

