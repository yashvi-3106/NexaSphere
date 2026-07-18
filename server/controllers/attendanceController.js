import { registrationsRepository } from '../repositories/registrationsRepository.js';
import { eventsRepository } from '../repositories/eventsRepository.js';
import { emitToRole } from '../config/socket.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      const status = e.status || 500;
      sendError(req, res, e?.message || 'Internal server error', status, 'INTERNAL_ERROR');
    });
}

export const markAttendance = wrapAsync(async (req, res) => {
  const { eventId, token, email } = req.body;
  if (!eventId && !token && !email) {
    return sendError(req, res, 'Provide eventId and either token or email', 400, 'VALIDATION_ERROR');
  }

  let registration;
  if (token) {
    registration = await registrationsRepository.findByTicketToken(token);
  } else if (email && eventId) {
    registration = await registrationsRepository.findByEmailAndEvent(email, eventId);
  }

  if (!registration) {
    return sendError(req, res, 'Registration not found', 404, 'NOT_FOUND');
  }

  if (registration.attended) {
    return sendSuccess(res, { ...registration, already_attended: true });
  }

  const updated = await registrationsRepository.markAttendance(registration.id);
  if (!updated) {
    return sendError(req, res, 'Failed to mark attendance', 500, 'INTERNAL_ERROR');
  }

  try {
    emitToRole('events_admin', 'admin:attendance-marked', {
      eventId: registration.event_id,
      userName: registration.full_name,
      email: registration.email,
      timestamp: new Date(),
    });
  } catch (e) {
    console.error('[Attendance] Failed to broadcast:', e);
  }

  return sendSuccess(res, { ...updated, already_attended: false });
});

export const getAttendanceList = wrapAsync(async (req, res) => {
  const eventId = String(req.params.eventId || '').trim();
  if (!eventId) {
    return sendError(req, res, 'Event ID required', 400, 'VALIDATION_ERROR');
  }
  const registrations = await registrationsRepository.findByEventId(eventId);
  return sendSuccess(res, { registrations });
});
