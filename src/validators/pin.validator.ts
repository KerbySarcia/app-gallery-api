import { z } from "zod";

// const pageNumber = Number(req.query.cursor) || 0;
// const search = req.query.search;
// const userId = req.query.userId;
// const boardId = req.query.boardId;

export const getPinsValidator = z
  .object({
    cursor: z.string().optional(),
    search: z.string().optional(),
    userId: z.string().optional(),
    boardId: z.string().optional(),
  })
  .strict();

export const getPinValidator = z
  .object({
    id: z.string(),
  })
  .strict();
