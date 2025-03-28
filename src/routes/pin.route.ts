import express from "express";
import {
  getPins,
  getPin,
  createPin,
  interactionCheck,
  interact,
} from "../controllers/pin.controller";
import { verifyToken } from "../middlewares/verify-token.middleware";
import validateRequest from "../middlewares/validate-request.middleware";
import { getPinsValidator, getPinValidator } from "../validators/pin.validator";

const router = express.Router();

router.get("/", validateRequest({ query: getPinsValidator }), getPins);
router.get("/:id", validateRequest({ params: getPinValidator }), getPin);
router.post("/", verifyToken, createPin);
router.get("/interaction-check/:id", interactionCheck);
router.post("/interact/:id", verifyToken, interact);

export default router;
