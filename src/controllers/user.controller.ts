import User from "../models/user.model";
import Follow from "../models/follow.model";

import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookieOption } from "../constants/cookie-option.constant";
import { statusCode } from "../constants/status-code.constant";

// Define the expected structure of the payload
interface MyJwtPayload extends JwtPayload {
  userId: string;
}

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

export const getUser = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  const followerCount = await Follow.countDocuments({ following: user._id });
  const followingCount = await Follow.countDocuments({ follower: user._id });

  const token = req.cookies.token;

  if (!token) {
    res.status(200).json({
      ...detailsWithoutPassword,
      followerCount,
      followingCount,
      isFollowing: false,
    });
  } else {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as MyJwtPayload;

    const isExists = await Follow.exists({
      follower: payload.userId,
      following: user._id,
    });

    res.status(200).json({
      ...detailsWithoutPassword,
      followerCount,
      followingCount,
      isFollowing: isExists ? true : false,
    });
  }
};

export const followUser = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    res.status(400).json({ message: "user does not exist!" });
    return;
  }

  const isFollowing = await Follow.exists({
    follower: res.locals.userId,
    following: user._id,
  });

  if (isFollowing) {
    await Follow.deleteOne({
      follower: res.locals.userId,
      following: user._id,
    });
  } else {
    await Follow.create({ follower: res.locals.userId, following: user._id });
  }

  res.status(200).json({ message: "Successful" });
};
