import { z } from "zod";

export const getPostCommentsValidator = z
  .object({
    postId: z.string().min(1, "post id is empty"),
  })
  .strict();

export const addCommentValidator = z
  .object({
    description: z.string().min(1, "description is empty"),
    pin: z.string().min(1, "pin is empty"),
  })
  .strict();
