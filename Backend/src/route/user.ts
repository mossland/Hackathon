import { Router } from "express";
import { verifyToken, verifyRecaptcha } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { Big } from "big.js";
import uuidv7 from '../util/uuidv7';

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

router.post('/faucet', verifyToken, verifyRecaptcha, async (req, res, next) => {
  try{
    const point = await Platform.instance.fetchUserPoint(res.locals.user.id);
    const bPoint = new Big(point);

    if (bPoint.gte(1000)) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, 'already have enough point'));
    }

    const bFaucetVal = new Big(1000).sub(bPoint);
    await Platform.instance.updateUserPoint(res.locals.user.id, `faucet_${uuidv7()}`, bFaucetVal.toNumber());
    
    return res.status(200).send({
      success: true,
      deltaPoint: bFaucetVal.toNumber(),
    });
  } catch (e) {
    if ((e as any).message) {
      console.error((e as any).message);
    }
    return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
  }
});

export default router;