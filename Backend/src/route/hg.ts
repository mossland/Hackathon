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

router.get('/open', createGameStateValidator(2), )

router.post('/result', createGameStateValidator(1), validateUserGameInput, verifyToken, async (req, res, next) => {
  try {
    
    // return res.status(200).send({
    //   success: true,
    //   ticket
    // });
  } catch (e) {
    console.error(e);
    return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'internal server error'));
  }
});

export default router;