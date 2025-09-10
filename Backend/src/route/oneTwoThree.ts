import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateOneTwoThreeGameInput, createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const oneTwoThreeGameId = 10;

router.post('/result', createGameStateValidator(oneTwoThreeGameId), validateBetAmount, validateOneTwoThreeGameInput, verifyToken, async (req, res, next) => {
	try {
    const winNumber: number = Number(req.body.winNumber);
    const tieNumber: number = Number(req.body.tieNumber);
		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}

		const ticket: ITicketModel = await spendByGameId(
			oneTwoThreeGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
        const N_BIT = 32;
        const computerHex = hash.slice(0, 32).slice(0, N_BIT / 4);
        const computerDecimal = parseInt(computerHex, 16);
        const computerHashValue = new Big(computerDecimal).mod(3).plus(1).toNumber();

        let payoutBig = new Big(0);

        if (winNumber === computerHashValue){
          if (tieNumber === 0){
            payoutBig = new Big(3);
          }
          else{
            payoutBig = new Big(2);
          }
        }
        else if (tieNumber === computerHashValue){
          payoutBig = new Big(1);
        }

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
						winNumber : winNumber,
            tieNumber : tieNumber,
            resultNumber : computerHashValue,
						multiplier : payoutBig.toNumber(),
					}
				};
			}
		);

		return res.status(200).send({
			success: true,
			ticket,
		});
	} catch (e) {
		console.error(e);
		return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
	}
});

export default router;