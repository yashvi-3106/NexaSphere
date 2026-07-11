import { z } from 'zod';
import { generatePrefixedId } from '../utils/uuid.js';

export const bannerSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1).max(120),
    imageUrl: z.string().trim().url(),
    linkUrl: z.string().trim().url().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    isActive: z.boolean().optional().default(true),
  })
  .transform((data) => {
    return {
      ...data,
      id: data.id || generatePrefixedId('banner'),
    };
  });
