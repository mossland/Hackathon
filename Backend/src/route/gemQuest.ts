import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateGemQuestGameInput, createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const gemQuestGameId = 6;


function getMatchCount(arr: number[]) {
    let typeCount = new Array(7);
    typeCount.fill(0);

    arr.forEach(e => {
        typeCount[e]++;
    });

    return typeCount;
};

function getResult(arr: number[]) {
    let result = arr.filter(element => element >= 2);
    let sortedResult = result.sort((a, b) => b - a);

    if (sortedResult.length === 0) {
		return 0;
	} else if (sortedResult.length === 1) {
        if (sortedResult[0] === 2) return 0.1;
        if (sortedResult[0] === 3) return 3;
        if (sortedResult[0] === 4) return 5;
        if (sortedResult[0] === 5) return 50;
		return 0;
    } else if (sortedResult.length === 2){
        if (sortedResult[0] === 2) return 2;
        if (sortedResult[0] === 3) return 4;
		return 0;
    } else {
		return 0;
	}
};

router.post('/result', createGameStateValidator(gemQuestGameId), validateBetAmount, validateGemQuestGameInput, verifyToken, async (req, res, next) => {
	try {
		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}

		const ticket: ITicketModel = await spendByGameId(
			gemQuestGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
				// Extract 5 numbers between 0-6 from the hash
				const gemNumbers: number[] = [];
				for (let i = 0; i < 5; i++) {
					const sliceStart = i * 8;
					const sliceEnd = sliceStart + 8;
					const numberHex = hash.slice(sliceStart, sliceEnd);
					const numberDecimal = parseInt(numberHex, 16);
					const number = new Big(numberDecimal).mod(7).toNumber();
					gemNumbers.push(number);
				}

				let resultCount = getMatchCount(gemNumbers);
				let multiplier = getResult(resultCount);
				const payoutBig = new Big(multiplier);

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
						gems: gemNumbers,
						multiplier,
						gemResultCount: resultCount,
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