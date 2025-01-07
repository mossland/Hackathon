import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateHeadsOrTailsGameInput, createGameStateValidator } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const headsOrTailsGameId = 4;

router.post('/result', createGameStateValidator(headsOrTailsGameId), validateHeadsOrTailsGameInput, verifyToken, async (req, res, next) => {
	try {
		// 0 heads, 1 tails
		const userPick = parseInt(req.body.pick);

		if (userPick !== 0 && userPick !== 1) {
			return next(new ServerError(StatusCodes.BAD_REQUEST, 'Invalid input'));
		}

		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}


		const ticket: ITicketModel = await spendByGameId(
			headsOrTailsGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
				const N_BIT = 32;
				const computerHex = hash.slice(0, 32).slice(0, N_BIT / 4);
				const computerDecimal = parseInt(computerHex, 16);
				const computerHashValue = new Big(computerDecimal).mod(2);

				// 0 heads, 1 tails
				const defaultPayoutResultByUserPick: { [keys: string]: any } = {
					'0': {
						0: 2,
						1: 0,
					},
					'1': {
						0: 0,
						1: 2,
					}
				};

				const payoutBig = new Big(defaultPayoutResultByUserPick[req.body.pick as any][computerHashValue.toNumber()]);

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
						userPick: userPick,
						computerPick: computerHashValue.toNumber(),
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