import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import db from '../db';

Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' && 
    isFinite(value) && 
    Math.floor(value) === value;
};

export const validateUserGameInput = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof(req.body.pick) === typeof(undefined) || typeof(req.body.betAmount) === typeof(undefined)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  const pick = parseInt(req.body.pick);
  const betAmount = parseInt(req.body.betAmount);

  if (isNaN(pick) || isNaN(betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  if (!Number.isInteger(pick) || !Number.isInteger(betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
  }

  if (betAmount <= 0) {
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
