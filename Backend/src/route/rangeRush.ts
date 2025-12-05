import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from "big.js";
import { validateRangeRushGameInput, createGameStateValidator, validateBetAmount } from "../middleware/validator";
import { verifyToken } from "../middleware/auth";
import StatusCodes from "http-status-codes";
import ServerError from "../util/serverError";
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const rangeRushGameId = 13;

const CardType = { Clubs: 0, Spades: 1, Diamonds: 2, Hearts: 3 } as const;
type Suit = (typeof CardType)[keyof typeof CardType];

const CardNumber = {
  Ace: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
  Jack: 11,
  Queen: 12,
  King: 13,
} as const;
type Rank = (typeof CardNumber)[keyof typeof CardNumber];

interface Card {
  suit: Suit;
  rank: Rank;
}

export interface GameResult {
  point: number; // 0~9
  win: boolean;
  odds: number;
  payout: number;
  pickedK: number;
}

function shuffleArrayWithHash(array: Card[], hash: string): Card[] {
  const pool = array.slice();

  let bytes = new TextEncoder().encode(hash);
  if (bytes.length === 0) bytes = new Uint8Array([0]);

  let k = 0;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = bytes[k++ % bytes.length] % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool;
}

export function norm10(v: number): number {
  return ((v % 10) + 10) % 10;
}

export function pointOfRank(rank: Rank): number {
  return rank >= 10 ? 0 : rank; // 10/J/Q/K → 0
}

export function insideInclusive(num: number, low: number, high: number): boolean {
  const n = norm10(num);
  const l = norm10(low);
  const h = norm10(high);

  return l <= h ? n >= l && n <= h : n >= l || n <= h; // wrap
}

export function rangeOddsDecimal(low: number, high: number, invert: boolean = false, houseEdge: number = 0): number {
  const N = 10; // 전체 숫자 10개 (0‥9)

  const L = norm10(low);
  const U = norm10(high);

  const forward = (U - L + N) % N; // 0‥9
  const insideInclusiveCount = forward + 1; // 1‥10
  const outsideInclusiveCount = N - Math.max(insideInclusiveCount - 2, 0);

  const k = invert ? outsideInclusiveCount : insideInclusiveCount;

  if (k === 0) return Infinity; // 승리 숫자 없음 → 베팅 불가

  const dec = Big(N).times(Big(1).minus(houseEdge)).div(k);
  return Number(dec.toFixed(2)); // 둘째 자리 반올림
}

export function getResult(deck: Card[], lowValue: number, highValue: number, invert: boolean, houseEdge: number = 0): GameResult {
  if (!Array.isArray(deck) || deck.length < 4) {
    throw new Error("deck must have at least 4 cards");
  }

  let total = 0;
  for (let i = 0; i < 4; i++) {
    total += pointOfRank(deck[i].rank);
  }
  const point = total % 10; // 0‥9

  const win = invert
    ? !insideInclusive(point, lowValue, highValue) // Outside
    : insideInclusive(point, lowValue, highValue); // Inside

  const odds = rangeOddsDecimal(lowValue, highValue, invert, houseEdge || 0);

  return {
    point,
    win,
    odds,
    payout: win ? odds : 0,
    pickedK: invert ? 10 - (((highValue - lowValue + 10) % 10) + 1 - 2) : ((highValue - lowValue + 10) % 10) + 1,
  };
}

function createDeck(): Card[] {
  const deck: Card[] = [];

  const cardTypes = Object.values(CardType) as Suit[];
  const cardNumbers = Object.values(CardNumber) as Rank[];

  for (const type of cardTypes) {
    for (const number of cardNumbers) {
      const card: Card = { suit: type, rank: number };
      deck.push(card);
    }
  }

  return deck;
}

router.post(
  "/result",
  createGameStateValidator(rangeRushGameId),
  validateBetAmount,
  validateRangeRushGameInput,
  verifyToken,
  async (req, res, next) => {
    try {
      const low: number = Number(req.body.low);
      const high: number = Number(req.body.high);
      const invert: boolean = req.body.invert as boolean;
      const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

      if (new Big(userPoint).lt(req.body.betAmount)) {
        return next(new ServerError(StatusCodes.FORBIDDEN, "Not enough point"));
      }

      const ticket: ITicketModel = await spendByGameId(rangeRushGameId, new Big(req.body.betAmount), res.locals.user.id, (hash) => {
        const deck = createDeck();
        const shuffledDeck = shuffleArrayWithHash(deck, hash);

        const gameResult: GameResult = getResult(shuffledDeck, low, high, invert);

        let multiplier: Big = new Big(gameResult.payout);

        return {
          payout: multiplier.toNumber(),
          meta: {
            hash,
            raceCards: shuffledDeck,
            isWin: gameResult.win,
            multiplier: multiplier.toNumber(),
          },
        };
      });

      return res.status(200).send({
        success: true,
        ticket,
      });
    } catch (e) {
      console.error(e);
      return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, "internal server error"));
    }
  }
);

export default router;
