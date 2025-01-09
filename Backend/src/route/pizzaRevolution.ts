import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validatePizzaRevolutionGameInput, createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const pizzaRevolutionGameId = 5;

function isRedNumber(num: number){
    switch(num){
        case 1:
        case 7:
        case 5:
        case 8:
            return true;
        default:
            return false;
    }
}

router.post('/result', createGameStateValidator(pizzaRevolutionGameId), validateBetAmount, validatePizzaRevolutionGameInput, verifyToken, async (req, res, next) => {
	try {
        // number  0 - user not select, 1-8
        // color  0 - user not select, 1 - red, 2 - black		
		const userPickNumber = parseInt(req.body.userPickNumber);
        const userPickColor = parseInt(req.body.userPickColor);

		if (userPickNumber === 0 && userPickColor === 0) {
			return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
		}

        if (userPickNumber !== 0 && userPickColor !== 0) {
            return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
        }

		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}


		const ticket: ITicketModel = await spendByGameId(
			pizzaRevolutionGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
				const N_BIT = 32;
				const deckHex = hash.slice(0, 32).slice(0, N_BIT / 4);
				const deckDecimal = parseInt(deckHex, 16);
				const deckHashValue = new Big(deckDecimal).mod(8);

                let payoutBig = Big(0);
                if (userPickNumber) {
                    if (deckHashValue.eq(userPickNumber)) {
                        payoutBig = Big(8)
                    } else {
                        payoutBig = Big(0)
                    }
                } else {
                    const isNumberRed = isRedNumber(deckHashValue.toNumber());
                    if (isNumberRed && userPickColor === 1) {
                        payoutBig = Big(2)
                    } else if (!isNumberRed && userPickColor === 2) {
                        payoutBig = Big(2)
                    } else {
                        payoutBig = Big(0)
                    }
                }

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
						userPickNumber: userPickNumber,
						userPickColor: userPickColor,
						resultNumber: deckHashValue.toNumber(),
						multiplier: payoutBig.toNumber(),
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