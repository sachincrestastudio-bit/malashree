import { z } from "zod";

export const OrderSchema = z.object({
  kitchenId: z.string(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});
