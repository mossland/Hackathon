import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from "big.js";
import {
  validateHorseRaceGameInput,
  createGameStateValidator,
  validateBetAmount,
} from "../middleware/validator";
import { verifyToken } from "../middleware/auth";
import StatusCodes from "http-status-codes";
import ServerError from "../util/serverError";
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const horseRaceGameId = 12;

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
  type: Suit;
  number: Rank;
}

const ODDS_BY_COUNT = [3.7, 3.9, 4.2, 4.2] as const;
const WIN_THRESHOLD = 8 as const;

function shuffleArrayWithHashKeepTop(
  array: Card[],
  topCards: Card[],
  hash: string
): Card[] {
  const pool = array.slice();
  const keptTop: Card[] = [];

  for (const t of topCards) {
    const idx = pool.findIndex(
      (c) => c.type === t.type && c.number === t.number
    );
    if (idx !== -1) {
      keptTop.push(t);
      pool.splice(idx, 1);
    }
  }

  let bytes = new TextEncoder().encode(hash);
  if (bytes.length === 0) bytes = new Uint8Array([0]);

  let k = 0;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = bytes[k++ % bytes.length] % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return keptTop.concat(pool);
}

export function getGameOdds(
  topCards: Card[]
): [number, number, number, number] {
  const counts: [number, number, number, number] = [0, 0, 0, 0];

  for (const { type } of topCards) {
    counts[type] += 1;
  }

  const odds = counts.map((c) => ODDS_BY_COUNT[c] ?? 100) as [
    number,
    number,
    number,
    number
  ];
  return odds;
}

function createDeck(): Card[] {
  const deck: Card[] = [];

  const cardTypes = Object.values(CardType) as Suit[];
  const cardNumbers = Object.values(CardNumber) as Rank[];

  for (const type of cardTypes) {
    for (const number of cardNumbers) {
      const card: Card = { type, number };
      deck.push(card);
    }
  }

  return deck;
}

function getWinner(raceResult: number[], threshold = WIN_THRESHOLD): number {
  for (let i = 0; i < raceResult.length; i++) {
    if (raceResult[i] >= threshold) return i;
  }
  return -1;
}

function runRace(
  shuffledDeck: Card[],
  topCardsCount: number,
  threshold = WIN_THRESHOLD
) {
  const raceResult = [0, 0, 0, 0] as [number, number, number, number];
  let winner = -1;

  for (let i = topCardsCount; i < shuffledDeck.length; i++) {
    const t = shuffledDeck[i].type;
    raceResult[t]++;

    if (raceResult[t] >= threshold) {
      winner = t;
      break;
    }
  }

  return { winner, raceResult };
}

router.post(
  "/result",
  createGameStateValidator(horseRaceGameId),
  validateBetAmount,
  validateHorseRaceGameInput,
  verifyToken,
  async (req, res, next) => {
    try {
      const userPick: number = Number(req.body.pick);
      const topCards: Card[] = req.body.topCards as Card[];
      const userPoint: number = await Platform.instance.fetchUserPoint(
        res.locals.user.id
      );

      if (new Big(userPoint).lt(req.body.betAmount)) {
        return next(new ServerError(StatusCodes.FORBIDDEN, "Not enough point"));
      }

      const ticket: ITicketModel = await spendByGameId(
        horseRaceGameId,
        new Big(req.body.betAmount),
        res.locals.user.id,
        (hash) => {
          const odds = getGameOdds(topCards);
          const multiplier = odds[userPick];
          let payoutBig = new Big(multiplier);

          const deck = createDeck();
          const shuffledDeck = shuffleArrayWithHashKeepTop(
            deck,
            topCards,
            hash
          );

          const { winner, raceResult } = runRace(shuffledDeck, topCards.length);

          if (userPick !== winner) {
            payoutBig = new Big(0);
          }

          return {
            payout: payoutBig.toNumber(),
            meta: {
              hash,
              raceCards: shuffledDeck,
              playerHorse: userPick,
              winner: winner,
              multiplier: payoutBig.toNumber(),
            },
          };
        }
      );

      return res.status(200).send({
        success: true,
        ticket,
      });
    } catch (e) {
      console.error(e);
      return next(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "internal server error"
        )
      );
    }
  }
);

export default router;
