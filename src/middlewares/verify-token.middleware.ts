import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Not authenticated!" });
    return;
  }

  // @ts-ignore
  jwt.verify(token, process.env.JWT_SECRET as string, async (err, payload) => {
    if (err) {
      res.status(403).json({ message: "Token is invalid!" });
      return;
    }

    res.locals.userId = payload.userId;

    next();
  });
};
