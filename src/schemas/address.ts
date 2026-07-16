import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('India'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
