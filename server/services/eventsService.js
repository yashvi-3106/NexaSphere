import { eventsRepository } from '../repositories/eventsRepository.js';
import { eventSchema } from '../validators/eventSchemas.js';
import { recordEventCreated } from '../observability/metrics.js';
import { scheduleReminderJob } from './queueService.js';
import logger from '../utils/logger.js';
import { getCachedQuery, clearCache } from '../utils/redis.js';

export const eventsService = {
  async listEvents({
    page = 1,
    limit = 20,
    status,
    studentGroups,
    startDate,
    endDate,
    category,
    location,
    search,
  } = {}) {
    const cacheKey = `events:list:${JSON.stringify({ page, limit, status, studentGroups, startDate, endDate, category, location, search })}`;
    return getCachedQuery(
      cacheKey,
      () =>
        eventsRepository.list({
          page,
          limit,
          status,
          studentGroups,
          startDate,
          endDate,
          category,
          location,
          search,
        }),
      300
    ); // 5 minutes cache
  },

  async createEvent(input) {
    const event = eventSchema.parse(input);
    const created = await eventsRepository.create(event);
    recordEventCreated();
    clearCache('events:list:*');

    // Emit real-time notification to all connected clients
    try {
      emitToRoom('notifications-room', 'event-published', {
        eventId: created.id,
        eventName: created.name,
      });
    } catch (socketErr) {
      logger.warn(`Could not emit event-published notification: ${socketErr.message}`);
    }

    // Attempt to schedule a reminder if date is parseable
    try {
      const eventDate = new Date(created.date);
      if (!isNaN(eventDate.getTime())) {
        // Schedule reminder 1 hour before the event
        const reminderTime = eventDate.getTime() - 60 * 60 * 1000;
        const delay = reminderTime - Date.now();
        if (delay > 0) {
          await scheduleReminderJob({ eventId: created.id, delayMs: delay });
        }
      }
    } catch (err) {
      logger.warn(`Could not schedule reminder for event ${created.id}: ${err.message}`);
    }

    return created;
  },

  async updateEvent(id, input) {
    const patch = eventSchema.partial().parse({ ...input, id });
    const updated = await eventsRepository.update(id, patch);
    if (updated) {
      clearCache('events:list:*');
      try {
        const eventDate = new Date(updated.date);
        if (!isNaN(eventDate.getTime())) {
          const reminderTime = eventDate.getTime() - 60 * 60 * 1000;
          const delay = reminderTime - Date.now();
          if (delay > 0) {
            // Note: In a complete system we might cancel the old job and schedule a new one,
            // but for now we simply schedule the new reminder time.
            await scheduleReminderJob({ eventId: updated.id, delayMs: delay });
          }
        }
      } catch (err) {
        logger.warn(`Could not update reminder for event ${updated.id}: ${err.message}`);
      }
    }

    return updated;
  },

  async deleteEvent(id) {
    const deleted = await eventsRepository.delete(id);
    clearCache('events:list:*');
    return deleted;
  },
  async adminListEvents({
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    category,
    location,
    search,
  } = {}) {
    return eventsRepository.listAll({
      page,
      limit,
      status,
      startDate,
      endDate,
      category,
      location,
      search,
    });
  },
};
