import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateL7DGameInput, createGameStateValidator } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const l7dGameId = 3;

export enum EL7DUserPick {
  OVER = 'over',
  SEVEN = 'seven',
  UNDER = 'under',
}

router.post('/bet', createGameStateValidator(l7dGameId), validateL7DGameInput, verifyToken, async (req, res, next) => {
  try {
    const userPick: string = req.body.pick.toString();
    const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

    if (new Big(userPoint).lt(req.body.betAmount)) {
      return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
    }

    const ticket: ITicketModel = await spendByGameId(
      l7dGameId,
      new Big(req.body.betAmount),
      res.locals.user.id,
      (hash) => {
        const multiplierObj = {
          [EL7DUserPick.OVER]: Big(2),
          [EL7DUserPick.SEVEN]: Big(5),
          [EL7DUserPick.UNDER]: Big(2),
        };

        const N_BIT = 32;
        const openHex = hash.slice(0, 32).slice(0, N_BIT / 4);
        const openDecimal = parseInt(openHex, 16);
        const openHashValue = new Big(openDecimal).mod(6).add(1);
        
        const hiddenHex = hash.slice(32).slice(0, N_BIT / 4);
        const hiddenDecimal = parseInt(hiddenHex, 16);
        const hiddenHashValue = new Big(hiddenDecimal).mod(6).add(1);

        const sum = openHashValue.add(hiddenHashValue);
        
        let result: EL7DUserPick;
        if (sum.eq(7)) {
          result = EL7DUserPick.SEVEN;
        } else if (sum.lt(7)) {
          result = EL7DUserPick.UNDER;
        } else {
          result = EL7DUserPick.OVER;
        }



        let payout: number = 0;
        if (userPick === result) {
          payout = multiplierObj[userPick].toNumber();
        } else {
          payout = 0;
        }
        
        return {
          payout,
          meta: {
            hash,
            userPick,
            openCard: openHashValue.toNumber(),
            hiddenCard: hiddenHashValue.toNumber(),
            result,
          }
        };
      }
    );
    
    return res.status(200).send({
      success: true,
      ticket
    });
  } catch (e) {
    console.error(e);
    return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
  }
});

export default router;