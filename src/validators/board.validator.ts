import { z } from "zod";

export const getUserBoardsValidator = z
  .object({
    userId: z.string().min(1, { message: "User ID is required" }),
  })
  .strict();
