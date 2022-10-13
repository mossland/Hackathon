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
        const resultHash = hash.slice(0, 32);
        const multiplier = hash.slice(32);
        const computer = new Big(BigInt(`0x${resultHash}`).toString()).mod(3);
        const multiplierResult = new Big(BigInt(`0x${multiplier}`).toString()).mod(10).plus(1);

        // rock : 0, paper : 1, scissors : 2
        const defaultPayoutResultByUserPick: { [keys: string]: any } = {
          '0': {
            0: 1,
            1: 0,
            2: 3,
          },
          '1': {
            0: 3,
            1: 1,
            2: 0,
          },
          '2': {
            0: 0,
            1: 3,
            2: 1,
          }
        };

        const payoutBig = new Big(defaultPayoutResultByUserPick[req.body.pick as any][computer.toNumber()]);
        const payout = payoutBig.eq(1) ? 1 : payoutBig.mul(multiplierResult).toNumber();
        return {
          payout,
          meta: {
            hash,
            userPick: userPickNum,
            computerPick: computer.toNumber(),
            multiplier: multiplierResult.toNumber(),
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