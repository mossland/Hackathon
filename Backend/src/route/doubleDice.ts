import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';
import { validateDoubleDiceGameInput, createGameStateValidator, validateBetAmount } from '../middleware/validator';
import { verifyToken } from '../middleware/auth';
import StatusCodes from 'http-status-codes';
import ServerError from '../util/serverError';
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const doubleDiceGameId = 7;


export enum EDDUserPick {
  TIE = 'tie',
  BLUE = 'blue',
  RED = 'red',
}

router.post('/result', createGameStateValidator(doubleDiceGameId), validateBetAmount, validateDoubleDiceGameInput, verifyToken, async (req, res, next) => {
	try {
    const userPick: string = req.body.pick.toString();
		const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

		if (new Big(userPoint).lt(req.body.betAmount)) {
			return next(new ServerError(StatusCodes.FORBIDDEN, 'Not enough point'));
		}

		const ticket: ITicketModel = await spendByGameId(
			doubleDiceGameId,
			new Big(req.body.betAmount),
			res.locals.user.id,
			(hash) => {
        const tieRate = [0, 0, 88, 25, 10, 6, 4, 4, 4, 6, 10, 25, 88];
				// Extract 5 numbers between 0-6 from the hash
				const diceNumbers: Big[] = []; //[blue, blue, red, red]
				const count = 4;
				const HEX_LENGTH = 8;
        for (let i = 0; i < count; i++) {
            const hex = hash.slice(i * HEX_LENGTH, (i + 1) * HEX_LENGTH);
            const decimal = parseInt(hex, 16);
            const hashValue = new Big(decimal).mod(6).add(1);
            diceNumbers.push(hashValue);
        }

        let blueDice = diceNumbers.slice(0, 2);
        let redDice = diceNumbers.slice(2, 4);

        let blueSum = blueDice[0].add(blueDice[1]);
        let redSum = redDice[0].add(redDice[1]);
        let multiplier = 0;
        let winner : EDDUserPick;
        if (blueSum.eq(redSum)){ // 'tie'
          if (userPick === 'tie'){
            const index = blueSum.toNumber();
            if (index >= 2 && index <= 12) {
              multiplier = tieRate[index];
            }
            else{
               throw new ServerError(StatusCodes.FORBIDDEN, 'Not enough point');
            }
          }
          winner = EDDUserPick.TIE;
        }
        else if (blueSum.lt(redSum)){ // red win
          if (userPick === 'red'){
            multiplier = 2;
          }
          winner = EDDUserPick.RED;
        } 
        else {   //blue win
          if (userPick === 'blue'){
            multiplier = 2;
          }
          winner = EDDUserPick.BLUE;
        }
				const payoutBig = new Big(multiplier);

				return {
					payout: payoutBig.toNumber(),
					meta: {
						hash,
						blue : [blueDice[0].toNumber(), blueDice[1].toNumber()],
            red : [redDice[0].toNumber(), redDice[1].toNumber()],
						multiplier,
						winner,
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