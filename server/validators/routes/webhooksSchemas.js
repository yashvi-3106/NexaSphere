import { z } from 'zod';

const WEBHOOK_EVENTS = [
  'event.created',
  'event.updated',
  'event.cancelled',
  'user.registered',
  'user.attendance_marked',
  'certificate.issued',
  'user.joined',
  'announcement.posted',
];

/**
 * Schema for POST / — Create a new webhook.
 */
export const createWebhookSchema = z
  .object({
    name: z.string().trim().max(200).optional(),
    url: z
      .string()
      .trim()
      .url('url must be a valid URL')
      .refine((val) => val.startsWith('https://'), {
        message: 'Webhook URL must use HTTPS',
      }),
    events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, 'At least one event type must be selected'),
    secret: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

/**
 * Schema for PUT /:webhookId — Update an existing webhook.
 */
export const updateWebhookSchema = z
  .object({
    name: z.string().trim().max(200).optional(),
    url: z
      .string()
      .trim()
      .url('url must be a valid URL')
      .refine((val) => !val || val.startsWith('https://'), {
        message: 'Webhook URL must use HTTPS',
      })
      .optional(),
    events: z.array(z.enum(WEBHOOK_EVENTS)).optional(),
    secret: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();
