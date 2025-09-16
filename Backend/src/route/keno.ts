import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateKenoGameInput, createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const kenoGameId = 11;

const winRate = [
  [0.3, 2.7],                                // pick 1
  [0.0, 1.3, 5.2],                           // pick 2
  [0.0, 0.0, 2.3, 40.0],                     // pick 3
  [0.0, 0.0, 1.2, 7.0, 100.0],               // pick 4
  [0.0, 0.0, 1.0, 3.2, 12.0, 300.0],         // pick 5
  [0.0, 0.0, 0.0, 1.6, 6.0, 120.0, 600.0],   // pick 6
  [0.0, 0.0, 0.0, 1.3, 4.8, 20.0, 380.0, 780.0], // pick 7
  [0.0, 0.0, 0.0, 1.1, 2.8, 8.0, 42.0, 250.0, 950.0], // pick 8
];

function shuffleArrayWithHash<T>(array: T[], hash: string): T[] {
  const result = [...array]; 
  const hashBytes = new TextEncoder().encode(hash); 

  let index = 0;
  for (let i = result.length - 1; i > 0; i--) {
    const byte = hashBytes[index % hashBytes.length];
    const j = byte % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
    index++;
  }

  return result;
}

function findIntersection(arr1 : number[], arr2: number[]) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    let intersection: number[] = [];
    intersection = [...set1].filter(item => set2.has(item));
        
    return intersection;
}

function createTable(): number[] {
  const table = Array.from({ length: 36 }, (_, index) => index + 1);
  return table;
}

router.post('/result', createGameStateValidator(kenoGameId), validateBetAmount, validateKenoGameInput, verifyToken, async (req, res, next) => {
	try {
    const userNumbers: number[] = req.body.userNumbers;
		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}

		const ticket: ITicketModel = await spendByGameId(
			kenoGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
        const table = createTable();
        const shuffleTable = shuffleArrayWithHash(table, hash);
        const winNumbers = shuffleTable.splice(0, 8);
        const matchResult = findIntersection(userNumbers, winNumbers);
        const multiplier = winRate[userNumbers.length - 1][matchResult.length];

        let payoutBig = new Big(multiplier);

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
            winNumbers : winNumbers,
            userNumbers: userNumbers,
            matchResult : matchResult,
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