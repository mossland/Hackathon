import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from 'big.js';

const router = Router();
const rspGameId = 1;

router.post("/result", async (req, res) => {
  try {
    const ticket = await spendByGameId(rspGameId, parseInt(req.body.betAmount), (hash) => {
      const resultHash = hash.slice(0, 32);
      const multiplier = hash.slice(32);
      const computer = new Big(BigInt(`0x${resultHash}`).toString()).mod(3);
      const multiplierResult = new Big(BigInt(`0x${multiplier}`).toString()).mod(10).plus(1);

      return {
        payout: 3,
        meta: {
          hash,
          userPick: req.body.pick,
          computerPick: computer,
          multiplier: multiplierResult,
        }
      };
    });
    res.status(200).send({
      success: true,
      ticket
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (e as any).message : '',
    });
  }
});

export default router;