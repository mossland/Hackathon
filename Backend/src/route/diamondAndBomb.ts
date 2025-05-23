import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateDianmondAndBombGameInput, createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const diamondAndBombGameId = 8;

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

function createDiaTable(diaCount: number, length: number): boolean[] {
  if (diaCount > length) {
    return [];
  }

  const table = Array.from({ length }, (_, i) => i < diaCount);
  return table;
}

router.post('/result', createGameStateValidator(diamondAndBombGameId), validateBetAmount, validateDianmondAndBombGameInput, verifyToken, async (req, res, next) => {
	try {
    const userPick: number = Number(req.body.pick);
    const diaCount: number = Number(req.body.diaCount);
		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}

		const ticket: ITicketModel = await spendByGameId(
			diamondAndBombGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
        const dia = new Big(diaCount);
        const total = new Big(25);
        const multiplier = new Big(1).div(dia.div(total)).toFixed(2);  // 1 / (dia / total)
				let payoutBig = new Big(multiplier);

        const table = createDiaTable(diaCount, 25);
        const shuffleTable = shuffleArrayWithHash(table, hash);

        if (shuffleTable[userPick] === false){
          payoutBig = new Big(0);
        }

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
						tileMap : shuffleTable,
            userPick : userPick,
            diaCount : diaCount,
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