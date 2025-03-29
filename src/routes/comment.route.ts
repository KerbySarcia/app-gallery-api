import express from "express";
import validateRequest from "../middlewares/validate-request.middleware";
import { addComment, getPostComments } from "../controllers/comment.controller";
import {
  addCommentValidator,
  getPostCommentsValidator,
} from "../validators/comment.validator";
import { verifyToken } from "../middlewares/verify-token.middleware";

const router = express.Router();

router.get(
  "/:postId",
  validateRequest({ params: getPostCommentsValidator }),
  getPostComments
);

router.post(
  "/",
  verifyToken,
  validateRequest({ body: addCommentValidator }),
  addComment
);

export default router;
