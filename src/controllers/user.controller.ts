import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { cookieOption } from "../constants/cookie-option.constant";
import { statusCode } from "../constants/status-code.constant";

export const registerUser = async (req: Request, res: Response) => {
  const { username, displayName, email, password } = req.body;

  const newHashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    displayName,
    email,
    hashedPassword: newHashedPassword,
  });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string
  );

  res.cookie("token", token, cookieOption);

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  res.status(statusCode.CREATED).json(detailsWithoutPassword);
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordCorrect) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string
  );

  res.cookie("token", token, cookieOption);

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  res.status(200).json(detailsWithoutPassword);
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token");

  res.status(200).json({ message: "Logout successful" });
};
