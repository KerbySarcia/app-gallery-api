import { NextFunction, Request, Response } from "express";
import RequestValidators from "../interfaces/request-validator.interface";
import { ZodError } from "zod";

const validateRequest = (validators: RequestValidators) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }

      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params);
      }

      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422);
      }
      next(error);
    }
  };
};

export default validateRequest;
