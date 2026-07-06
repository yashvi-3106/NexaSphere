import { z } from 'zod';

export const profileSetupSchema = z.object({
  role: z.enum(['mentor', 'mentee']),
  skills: z.array(z.string()).min(1, 'Select at least one skill/goal area'),
  capacity: z.number().int().min(1).max(3).optional(),
  timezone: z.string(),
  availability: z.array(z.string()),
  communicationStyle: z.string(),
});
