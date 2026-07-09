import { z } from 'zod';

export const endorseSkillSchema = z
  .object({
    skillName: z.string().trim().min(1, 'Skill name is required'),
  })
  .strict();
