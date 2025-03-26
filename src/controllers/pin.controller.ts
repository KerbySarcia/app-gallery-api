import Pin from "../models/pin.model";
import User from "../models/user.model";
import Like from "../models/like.model";
import Save from "../models/save.model";
import Board from "../models/board.model";
import sharp from "sharp";
import Imagekit from "imagekit";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const getPins = async (req: Request, res: Response) => {
  const pageNumber = Number(req.query.cursor) || 0;
  const search = req.query.search;
  const userId = req.query.userId;
  const boardId = req.query.boardId;
  const LIMIT = 21;

  const pins = await Pin.find(
    search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { tags: { $in: [search] } },
          ],
        }
      : userId
      ? { user: userId }
      : boardId
      ? { board: boardId }
      : {}
  )
    .limit(LIMIT)
    .skip(pageNumber * LIMIT);

  const hasNextPage = pins.length === LIMIT;

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  res
    .status(200)
    .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
};

export const getPin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pin = await Pin.findById(id).populate(
    "user",
    "username img displayName"
  );

  res.status(200).json(pin);
};

export const createPin = async (req: Request, res: Response) => {
  const {
    title,
    description,
    link,
    board,
    tags,
    textOptions,
    canvasOptions,
    newBoard,
  } = req.body;

  // @ts-ignore
  const media = req.files.media;

  //   if ((!title, !description, !media)) {
  //     res.status(400).json({ message: "All fields are required!" });
  //     return;
  //   }

  const parsedTextOptions = JSON.parse(textOptions || "{}");
  const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

  // @ts-ignore
  const metadata = await sharp(media.data).metadata();

  if (!metadata.width || !metadata.height) {
    res.status(400).json({ message: "Invalid image file" });
    return;
  }

  const originalOrientation =
    metadata.width < metadata.height ? "portrait" : "landscape";
  const originalAspectRatio = metadata.width / metadata.height;

  let clientAspectRatio = 0;
  let width;
  let height;

  if (parsedCanvasOptions.size !== "original") {
    clientAspectRatio =
      parsedCanvasOptions.size.split(":")[0] /
      parsedCanvasOptions.size.split(":")[1];
  } else {
    parsedCanvasOptions.orientation === originalOrientation
      ? // @ts-ignore
        (clientAspectRatio = originalOrientation)
      : (clientAspectRatio = 1 / originalAspectRatio);
  }

  width = metadata.width;
  height = metadata.width / clientAspectRatio;

  const imagekit = new Imagekit({
    publicKey: process.env.IK_PUBLIC_KEY as string,
    privateKey: process.env.IK_PRIVATE_KEY as string,
    urlEndpoint: process.env.IK_URL_ENDPOINT as string,
  });

  const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
  const textTopPosition = Math.round(
    (parsedTextOptions.top * height) / parsedCanvasOptions.height
  );

  // const transformationString = `w-${width},h-${height}${
  //   originalAspectRatio > clientAspectRatio ? ",cm-pad_resize" : ""
  // },bg-${parsedCanvasOptions.backgroundColor.substring(1)}${
  //   parsedTextOptions.text
  //     ? `,l-text,i-${parsedTextOptions.text},fs-${
  //         parsedTextOptions.fontSize * 2.1
  //       },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
  //         1
  //       )},l-end`
  //     : ""
  // }`;

  // FIXED TRANSFORMATION STRING

  let croppingStrategy = "";

  if (parsedCanvasOptions.size !== "original") {
    if (originalAspectRatio > clientAspectRatio) {
      croppingStrategy = ",cm-pad_resize";
    }
  } else {
    if (
      originalOrientation === "landscape" &&
      parsedCanvasOptions.orientation === "portrait"
    ) {
      croppingStrategy = ",cm-pad_resize";
    }
  }

  const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
    1
  )}${
    parsedTextOptions.text
      ? `,l-text,i-${parsedTextOptions.text},fs-${
          parsedTextOptions.fontSize * 2.1
        },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
          1
        )},l-end`
      : ""
  }`;

  imagekit
    .upload({
      // @ts-ignore
      file: media.data,
      // @ts-ignore
      fileName: media.name,
      folder: "test",
      transformation: {
        pre: transformationString,
      },
    })
    .then(async (response) => {
      // FIXED: ADD NEW BOARD
      let newBoardId;

      if (newBoard) {
        const response = await Board.create({
          title: newBoard,
          user: res.locals.userId,
        });
        newBoardId = response._id;
      }

      const newPin = await Pin.create({
        user: res.locals.userId,
        title,
        description,
        link: link || null,
        board: newBoardId || board || null,
        tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
        media: response.filePath,
        width: response.width,
        height: response.height,
      });
      res.status(201).json(newPin);
      return;
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
      return;
    });
};

export const interactionCheck = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.cookies.token;

  const likeCount = await Like.countDocuments({ pin: id });

  if (!token) {
    res.status(200).json({ likeCount, isLiked: false, isSaved: false });
    return;
  }

  // @ts-ignore
  jwt.verify(token, process.env.JWT_SECRET as string, async (err, payload) => {
    if (err) {
      res.status(200).json({ likeCount, isLiked: false, isSaved: false });
      return;
    }

    const userId = payload.userId;

    const isLiked = await Like.findOne({
      user: userId,
      pin: id,
    });
    const isSaved = await Save.findOne({
      user: userId,
      pin: id,
    });

    res.status(200).json({
      likeCount,
      isLiked: isLiked ? true : false,
      isSaved: isSaved ? true : false,
    });
  });
};

export const interact = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { type } = req.body;

  if (type === "like") {
    const isLiked = await Like.findOne({
      pin: id,
      user: res.locals.userId,
    });

    if (isLiked) {
      await Like.deleteOne({
        pin: id,
        user: res.locals.userId,
      });
    } else {
      await Like.create({
        pin: id,
        user: res.locals.userId,
      });
    }
  } else {
    const isSaved = await Save.findOne({
      pin: id,
      user: res.locals.userId,
    });

    if (isSaved) {
      await Save.deleteOne({
        pin: id,
        user: res.locals.userId,
      });
    } else {
      await Save.create({
        pin: id,
        user: res.locals.userId,
      });
    }
  }

  res.status(200).json({ message: "Successful" });
};
