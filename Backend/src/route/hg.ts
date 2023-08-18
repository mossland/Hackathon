import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import TicketModel, { IHgMetadata, ITicketModel } from "../model/ticketModel";

const router = Router();
const hgGameId = 2;

router.get('/start', createGameStateValidator(2), validateBetAmount, verifyToken, async (req, res, next) => {
    const betAmount = new Big(req.body.betAmount);
    const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

    if (new Big(userPoint).lt(betAmount)) {
        return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
    }

    const ticket = await TicketModel.createHgTicket(
        betAmount,
        res.locals.user.id,
    );

    res.status(200).send({
        success: true,
        payload: {
            balance: new Big(userPoint).minus(betAmount).toString(),
            betAmount: betAmount.toString(),
            openCard: { type: (ticket.meta as IHgMetadata).revealCardType, number: (ticket.meta as IHgMetadata).revealCardNumber },
        }
    })

});

router.post('/result', createGameStateValidator(2), verifyToken, async (req, res, next) => {
  try {
    const userPickNum = parseInt(req.body.pick);

    if (userPickNum !== 0 && userPickNum !== 1) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
    }
    
    await TicketModel.spendHgTicket(res.locals.user.id, userPickNum);
  } catch (e) {
    console.error(e);
    return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
  }
});

export default router;