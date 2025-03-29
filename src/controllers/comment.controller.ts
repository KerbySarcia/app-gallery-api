import { Request, Response } from "express";
import Comment from "../models/comment.model";

export const getPostComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const comments = await Comment.find({ pin: postId })
    .populate("user", "username img displayName")
    .sort({ createdAt: -1 });

  res.status(200).json(comments);
};

export const addComment = async (req: Request, res: Response) => {
  const { description, pin } = req.body;

  const userId = res.locals.userId;
  const comment = await Comment.create({ description, pin, user: userId });

  res.status(201).json(comment);
};
