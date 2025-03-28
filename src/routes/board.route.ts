import express from "express";
import validateRequest from "../middlewares/validate-request.middleware";
import { getUserBoards } from "../controllers/board.controller";
import { getUserBoardsValidator } from "../validators/board.validator";

const router = express.Router();

router.get(
  "/:userId",
  validateRequest({ params: getUserBoardsValidator }),
  getUserBoards
);

export default router;
