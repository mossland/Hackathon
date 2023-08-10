import { Router } from "express";
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";

const router = Router();

router.get('/info', verifyToken, async (req, res, next) => {
  try{
    return res.status(200).send({
      success: true,
      user: res.locals.user,
    });
  } catch (e) {
    console.error(e);
    return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
  }
});

router.get('/point', verifyToken, async (req, res, next) => {
  try{
    const point = await Platform.instance.fetchUserPoint(res.locals.user.id)
    return res.status(200).send({
      success: true,
      point,
    });
  } catch (e) {
    console.error(e);
    return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
  }
});

export default router;