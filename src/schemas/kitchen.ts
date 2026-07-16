import { z } from 'zod';

export const KitchenSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  status: z.enum(['active', 'inactive', 'maintenance']),
});
