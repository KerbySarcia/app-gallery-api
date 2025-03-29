import express from "express";
import {
  followUser,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller";
import validateRequest from "../middlewares/validate-request.middleware";
import {
  createUserValidator,
  followUserValidator,
  getUserValidator,
  loginUserValidator,
} from "../validators/user.validator";
import { verifyToken } from "../middlewares/verify-token.middleware";

const router = express.Router();

router.post(
  "/auth/register",
  validateRequest({ body: createUserValidator }),
  registerUser
);

router.post(
  "/auth/login",
  validateRequest({ body: loginUserValidator }),
  loginUser
);

router.post("/auth/logout", logoutUser);

router.get(
  "/:username",
  validateRequest({ params: getUserValidator }),
  getUser
);

router.post(
  "/follow/:username",
  validateRequest({ params: followUserValidator }),
  verifyToken,
  followUser
);

export default router;
