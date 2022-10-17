import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateUserGameInput, createGameStateValidator } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const rspGameId = 1;

router.post('/result', createGameStateValidator(1), validateUserGameInput, verifyToken, async (req, res, next) => {
  try {
    const userPickNum = parseInt(req.body.pick);

    if (userPickNum < 0 || userPickNum > 2) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
    }

    const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

    if (new Big(userPoint).lt(req.body.betAmount)) {
      return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
    }
    
    
    const ticket: ITicketModel = await spendByGameId(
      rspGameId,
      new Big(req.body.betAmount),
      res.locals.user.id,
      (hash) => {
        const N_BIT = 32;
        const computerHex = hash.slice(0, 32).slice(0, N_BIT / 4);
        const computerDecimal = parseInt(computerHex, 16);
        const computerHashValue = new Big(computerDecimal).div(new Big(2).pow(N_BIT)).mul(81).round(0, 0).mod(3);
        
        const multiplierHex = hash.slice(32).slice(0, N_BIT / 4);
        const multiplierDecimal = parseInt(multiplierHex, 16);
        const multiplierHashValue = new Big(multiplierDecimal).div(new Big(2).pow(N_BIT)).mul(100000).round(0, 0).plus(1);

        let multiplierResult;
        if (multiplierHashValue.lt(500)) {
          multiplierResult = 10;
        } else if (multiplierHashValue.lt(2000)) {
          multiplierResult = 7;
        } else if (multiplierHashValue.lt(5500)) {
          multiplierResult = 4;
        } else if (multiplierHashValue.lt(37500)) {
          multiplierResult = 1;
        } else {
          multiplierResult = 2;
        }

        // rock : 0, paper : 1, scissors : 2
        const defaultPayoutResultByUserPick: { [keys: string]: any } = {
          '0': {
            0: 1,
            1: 0,
            2: multiplierResult,
          },
          '1': {
            0: multiplierResult,
            1: 1,
            2: 0,
          },
          '2': {
            0: 0,
            1: multiplierResult,
            2: 1,
          }
        };

        const payoutBig = new Big(defaultPayoutResultByUserPick[req.body.pick as any][computerHashValue.toNumber()]);
        
        return {
          payout: payoutBig.toNumber(),
          meta: {
            hash,
            userPick: userPickNum,
            computerPick: computerHashValue.toNumber(),
            multiplier: multiplierResult,
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