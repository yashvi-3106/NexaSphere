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
        const now = Date.now();

        // Schedule reminder 24 hours before the event
        const delay24h = eventDate.getTime() - 24 * 60 * 60 * 1000 - now;
        if (delay24h > 0) {
          await scheduleReminderJob({
            eventId: created.id,
            type: 'event-reminder-24h',
            delayMs: delay24h,
          });
        }

        // Schedule reminder 1 hour before the event
        const delay1h = eventDate.getTime() - 60 * 60 * 1000 - now;
        if (delay1h > 0) {
          await scheduleReminderJob({
            eventId: created.id,
            type: 'event-reminder-1h',
            delayMs: delay1h,
          });
        }
      }
    } catch (err) {
      logger.warn(`Could not schedule reminders for event ${created.id}: ${err.message}`);
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
          const now = Date.now();

          const delay24h = eventDate.getTime() - 24 * 60 * 60 * 1000 - now;
          if (delay24h > 0) {
            await scheduleReminderJob({
              eventId: updated.id,
              type: 'event-reminder-24h',
              delayMs: delay24h,
            });
          }

          const delay1h = eventDate.getTime() - 60 * 60 * 1000 - now;
          if (delay1h > 0) {
            await scheduleReminderJob({
              eventId: updated.id,
              type: 'event-reminder-1h',
              delayMs: delay1h,
            });
          }
        }
      } catch (err) {
        logger.warn(`Could not update reminders for event ${updated.id}: ${err.message}`);
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
