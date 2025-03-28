import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";

import userRouter from "./routes/user.route";
import pinRouter from "./routes/pin.route";
import boardRouter from "./routes/board.route";

import connectDB from "./utils/connect-db.util";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(fileUpload());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

app.use("/api/users", userRouter);
app.use("/api/pins", pinRouter);
app.use("/api/boards", boardRouter);

app.use(
  (
    error: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(error.status || 500);

    res.json({
      message: error.message || "Something went wrong!",
      status: error.status,
      stack: error.stack,
    });
  }
);

app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
