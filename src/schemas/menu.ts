import { z } from "zod";

export const MenuItemSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string(),
  isVeg: z.boolean(),
});
