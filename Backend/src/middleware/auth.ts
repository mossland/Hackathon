import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    (req as any).token = bearerToken;
    next();
  } else {
    next(new ServerError(StatusCodes.UNAUTHORIZED, 'fail to verify user'));
  }
}