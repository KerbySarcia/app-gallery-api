import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller";
import validateRequest from "../middlewares/validate-request.middleware";
import {
  createUserValidator,
  loginUserValidator,
} from "../validators/user.validator";

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

export default router;
