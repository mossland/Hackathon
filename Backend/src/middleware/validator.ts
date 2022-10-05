import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';

export const verifyUserGameInput = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof(req.body.pick) === typeof(undefined) || typeof(req.body.betAmount) === typeof(undefined)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  const pick = parseInt(req.body.pick);
  const betAmount = parseInt(req.body.betAmount);

  if (isNaN(pick) || isNaN(betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  if (betAmount <= 0) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }
  
  next();
}