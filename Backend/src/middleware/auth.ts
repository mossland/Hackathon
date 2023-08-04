import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import axios from 'axios';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers['authorization'];

  if (!bearerToken) {
    return next(new ServerError(StatusCodes.UNAUTHORIZED, 'fail to verify user - auth header missing'));
  }

  try {
    const { data } = await axios.get(
      `${process.env.MOSSVERSE_PLATFORM_BASE}/user/whoAmI`,
      {
        headers: {
          Authorization: bearerToken,
        }
      }
    );

    res.locals.user = data;
    res.locals.token = bearerToken;
    return next();
  } catch (e) {
    if ((e as any).response) {
      console.error((e as any).response.status);
      console.error((e as any).response.data);
    }
    
    return next(new ServerError(StatusCodes.UNAUTHORIZED, 'fail to verify user'));
  }
}