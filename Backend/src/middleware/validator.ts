import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import db from '../db';
import Big from 'big.js';

Big.RM = 0;

function isInteger(value: any) {
  if (typeof value === typeof 1) {
    return isFinite(value) && Math.floor(value) === value;
  } else {
    try {
      return new Big(value).eq(new Big(value).round());
    } catch (e) {
      return false;
    }
  }
};
export const validateBetAmount = async (req: Request, res: Response, next: NextFunction) => {
  const betAmount = new Big(req.body.betAmount);
  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }
  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }
  next();
};
export const validateRSPGameInput = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof(req.body.pick) === typeof(undefined) || typeof(req.body.betAmount) === typeof(undefined)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }
  
  if (!isInteger(req.body.pick) || !isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  const pick = new Big(req.body.pick);
  const betAmount = new Big(req.body.betAmount);

  if (isNaN(pick.toNumber()) || isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }
  
  next();
}

export const createGameStateValidator = (gameId: number): (req: Request, res: Response, next: NextFunction)=> any => {
  return async function(req: Request, res: Response, next: NextFunction) {
    const rspgame = (await db('game').select('*').where('gameId', 1))[0];
    if (rspgame.isAvailable) {
      next();
    } else {
      return next(new ServerError(StatusCodes.FORBIDDEN, 'the game is not available now'));
    }
  }
}
