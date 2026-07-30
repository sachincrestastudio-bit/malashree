import { z } from "zod";

export const validate = <T>(schema: z.Schema<T>, data: unknown) => {
  return schema.safeParse(data);
};
