import { Router } from "express";
import { spendByGameId } from "../util/random";
import Big from "big.js";
import { validateLuckyMatchGameInput, createGameStateValidator, validateBetAmount } from "../middleware/validator";
import { verifyToken } from "../middleware/auth";
import StatusCodes from "http-status-codes";
import ServerError from "../util/serverError";
import Platform from "../util/platform";
import { ITicketModel } from "../model/ticketModel";

const router = Router();
const luckyMatchGameId = 12;

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

const MatchType = {
  Inside: "inside",
  Outside: "outside",
  Range_1: "range_1",
  Range_2: "range_2",
  Range_3: "range_3",
  Range_4: "range_4",
} as const;

type MatchType = (typeof MatchType)[keyof typeof MatchType];

interface Card {
  suit: Suit;
  rank: Rank;
}

interface MatchRange {
  type: MatchType;
  min: number;
  max: number;
  payout: number;
}

interface MatchResult {
  joker: Card;
  matchCard: Card | null;
  matchIndex: number | null;
  matchType: MatchType;
  payout: number;
  ioType: MatchType | null;
}

const ODDS_BY_COUNT = [3.7, 3.9, 4.2, 4.2] as const;

function shuffleArrayWithHashKeepTop(array: Card[], jokerCard: Card, hash: string): Card[] {
  const pool = array.slice();
  const keptTop: Card[] = [];

  const idx = pool.findIndex((c) => c.suit === jokerCard.suit && c.rank === jokerCard.rank);
  if (idx !== -1) {
    keptTop.push(jokerCard);
    pool.splice(idx, 1);
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

export function getGameOdds(topCards: Card[]): [number, number, number, number] {
  const counts: [number, number, number, number] = [0, 0, 0, 0];

  for (const { suit: type } of topCards) {
    counts[type] += 1;
  }

  const odds = counts.map((c) => ODDS_BY_COUNT[c] ?? 100) as [number, number, number, number];
  return odds;
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

const matchRanges: MatchRange[] = [
  { type: MatchType.Range_1, min: 1, max: 5, payout: 3.7 }, // 공정보다 약간 낮게
  { type: MatchType.Range_2, min: 6, max: 11, payout: 3.9 },
  { type: MatchType.Range_3, min: 12, max: 19, payout: 4.2 },
  { type: MatchType.Range_4, min: 20, max: 49, payout: 4.2 },
];

function getMatchResult(deck: Card[]): MatchResult {
  const joker = deck[0];
  const targetRank = joker.rank;

  let matchIndex: number | null = null;
  let matchCard: Card | null = null;

  for (let i = 1; i < deck.length; i++) {
    if (deck[i].rank === targetRank) {
      matchIndex = i;
      matchCard = deck[i];
      break;
    }
  }

  const position = matchIndex !== null ? matchIndex : deck.length;
  const oneBased = matchIndex !== null ? matchIndex : null;

  const matchedRange = matchRanges.find((r) => {
    return position >= r.min && position <= r.max;
  });

  const matchType: MatchType = matchedRange ? matchedRange.type : MatchType.Range_4;

  const payout: number = matchedRange ? matchedRange.payout : matchRanges[matchRanges.length - 1].payout;

  let ioType: MatchType | null = null;
  if (matchIndex !== null) {
    const sequencePosition = matchIndex;
    ioType = sequencePosition % 2 === 1 ? MatchType.Inside : MatchType.Outside;
  }

  return {
    joker,
    matchCard,
    matchIndex: oneBased,
    matchType,
    payout,
    ioType,
  };
}

router.post(
  "/result",
  createGameStateValidator(luckyMatchGameId),
  validateBetAmount,
  validateLuckyMatchGameInput,
  verifyToken,
  async (req, res, next) => {
    try {
      const userPick: number = Number(req.body.pick);
      const jokerCard: Card = req.body.jokerCard as Card;
      const matchType: MatchType = req.body.matchType as MatchType;
      const userPoint: number = await Platform.instance.fetchUserPoint(res.locals.user.id);

      if (new Big(userPoint).lt(req.body.betAmount)) {
        return next(new ServerError(StatusCodes.FORBIDDEN, "Not enough point"));
      }

      const ticket: ITicketModel = await spendByGameId(luckyMatchGameId, new Big(req.body.betAmount), res.locals.user.id, (hash) => {
        const deck = createDeck();
        const shuffledDeck = shuffleArrayWithHashKeepTop(deck, jokerCard, hash);

        const gameResult: MatchResult = getMatchResult(shuffledDeck);

        let isWin: boolean = false;
        let multiplier: Big = new Big(0);

        if (gameResult.matchType === matchType || gameResult.ioType === matchType) {
          isWin = true;
          multiplier = new Big(gameResult.payout);
          if (matchType === MatchType.Inside || matchType === MatchType.Outside) {
            multiplier = new Big(2.0);
          }
        }

        return {
          payout: multiplier.toNumber(),
          meta: {
            hash,
            raceCards: shuffledDeck,
            userMatchType: matchType as string,
            isWin: isWin,
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
