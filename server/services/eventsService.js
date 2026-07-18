import { eventsRepository } from '../repositories/eventsRepository.js';
import { eventSchema } from '../validators/eventSchemas.js';
import { recordEventCreated } from '../observability/metrics.js';
import { scheduleReminderJob } from './queueService.js';
import logger from '../utils/logger.js';


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
    return eventsRepository.list({
      page,
      limit,
      status,
      studentGroups,
      startDate,
      endDate,
      category,
      location,
      search,
    });
  },

  async createEvent(input) {
    const event = eventSchema.parse(input);
    let created;
    let createdEvents = [];

    if (event.recurrencePattern && event.recurrenceEndDate) {
      const { generatePrefixedId } = await import('../utils/uuid.js');
      const seriesId = generatePrefixedId('series');
      let currentDate = new Date(event.date);
      const endDate = new Date(event.recurrenceEndDate);
      let occurrenceIndex = 1;

      while (currentDate <= endDate && occurrenceIndex <= 365) {
        const occEvent = {
          ...event,
          id: `${event.id}-${occurrenceIndex}`,
          date: currentDate.toISOString(),
          seriesId,
          occurrenceIndex
        };

        const createdOcc = await eventsRepository.create(occEvent);
        createdEvents.push(createdOcc);

        if (event.recurrencePattern === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (event.recurrencePattern === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (event.recurrencePattern === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          break; // custom not fully supported for auto-generation yet
        }
        occurrenceIndex++;
      }
      created = createdEvents[0]; // main event
    } else {
      created = await eventsRepository.create(event);
      createdEvents.push(created);
    }
    
    recordEventCreated();

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

  async updateEvent(id, input, updateSeries = false) {
    const patch = eventSchema.partial().parse({ ...input, id });
    const updated = await eventsRepository.update(id, patch);

    if (updated) {
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

  async deleteEvent(id, deleteSeries = false) {
    let deleted;
    if (deleteSeries) {
      // Find event to get series_id
      const events = await eventsRepository.listAll({ search: id }); 
      const event = events.find(e => e.id === id);
      if (event && event.seriesId) {
        deleted = await eventsRepository.deleteSeries(event.seriesId);
      } else {
        deleted = await eventsRepository.delete(id);
      }
    } else {
      deleted = await eventsRepository.delete(id);
    }
    
    import('../utils/redis.js').then(m => m.clearCache('events:list:*'));
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
