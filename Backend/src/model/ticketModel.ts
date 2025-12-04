import Big from "big.js";
import uuidv7 from "../util/uuidv7";

import db from "../db";
import { generateHashString } from "../util/random";
import Platform from "../util/platform";

export interface ITicketModel {
  gameId: number;
  hashId: number;
  hashIdx: number;
  hashString: string;
  ticketId: string;
  betAmount: number;
  payout: number;
  meta: IRspMetadata | IHgMetadata;
}

export interface IRspMetadata {
  hash: string;
  userPick: number;
  computerPick: number;
  multiplier: number;
}

export interface IHeadsOrTailsMetadata extends IRspMetadata {}
export interface IPizzaRevolutionMetadata {
  hash: string;
  userPickNumber: number;
  userPickColor: number;
  resultNumber: number;
  multiplier: number;
}

export interface IHorseRaceMetadata {
  hash: string;
  raceCards: { type: number; number: number }[];
  playerHorse: number;
  winner: number;
  multiplier: number;
}

export interface IDianmondAndBombMetadata {
  hash: string;
  tileMap: boolean[];
  userPick: number;
  diaCount: number;
  multiplier: number;
}

export interface IDoubleDiceMetadata {
  hash: string;
  blue: number[];
  red: number[];
  multiplier: number;
  winner: "blue" | "tie" | "red";
}

export interface IGemQuestMetadata {
  hash: string;
  gems: number[];
  multiplier: number;
  gemResultCount: number[];
}

export interface IL7DMetadata {
  hash: string;
  userPick: string;
  openCard: number;
  hiddenCard: number;
  result: "over" | "under" | "seven";
}

export interface IHgMetadata {
  hash: string;
  userPick: number;
  revealCardType: number;
  revealCardNumber: number;
  hiddenCardType: number;
  hiddenCardNumber: number;
}

export interface IOneTwoThreeMetadata {
  hash: string;
  winNumber: number;
  tieNumber: number;
  resultNumber: number;
  multiplier: number;
}

export interface IKenoMetadata {
  hash: string;
  winNumbers: number[];
  userNumbers: number[];
  matchResult: number[];
  multiplier: number;
}

export interface ILuckyMatchMetadata {
  hash: string;
  raceCards: { type: number; number: number }[];
  userMatchType: string;
  isWin: boolean;
  multiplier: number;
}

export default class TicketModel {
  public static async createHgTicket(betAmount: Big, userId: string): Promise<ITicketModel> {
    const cardType = {
      Bananas: 0,
      Strawberries: 1,
      Limes: 2,
      Plums: 3,
    };
    const cardNumber = {
      One: 1,
      Two: 2,
      Three: 3,
      Four: 4,
      Five: 5,
      Six: 6,
    };

    const deck: number[][] = [];
    Object.values(cardType).forEach((type) => {
      Object.values(cardNumber).forEach((number) => {
        deck.push([type, number]);
      });
    });

    return new Promise((resolve, reject) => {
      db.transaction(async (trx) => {
        try {
          const { currentHash, hashString }: { currentHash: any; hashString: string } = await generateHashString(trx, 2);
          const N_BIT = 32;
          const revealCardHex = hashString.slice(0, 32).slice(0, N_BIT / 4);
          const revealCardDecimal = parseInt(revealCardHex, 16);
          const revealCardIdx = new Big(revealCardDecimal)
            .div(new Big(2).pow(N_BIT))
            .mul(new Big(deck.length).pow(4))
            .round(0, 0)
            .mod(deck.length);
          const revealCard = deck[revealCardIdx.toNumber()];

          const hiddenCardHex = hashString.slice(32).slice(0, N_BIT / 4);
          const hiddenCardDecimal = parseInt(hiddenCardHex, 16);
          const hiddenCardIdx = new Big(hiddenCardDecimal)
            .div(new Big(2).pow(N_BIT))
            .mul(new Big(deck.length).pow(4))
            .round(0, 0)
            .mod(deck.length);
          const hiddenCard = deck[hiddenCardIdx.toNumber()];

          const ticketId = uuidv7();

          const meta: IHgMetadata = {
            hash: hashString,
            userPick: -1,
            revealCardType: revealCard[0],
            revealCardNumber: revealCard[1],
            hiddenCardType: hiddenCard[0],
            hiddenCardNumber: hiddenCard[1],
          };

          const newTicket: any = {
            gameId: 2,
            hashId: currentHash.hashId,
            hashIdx: currentHash.hashIdx,
            hashString,
            ticketId,
            betAmount: betAmount.toNumber(),
            payout: 0,
            meta: JSON.stringify(meta),
            isResultSet: false,
          };

          let pointDelta = betAmount.mul(-1);

          await Platform.instance.updateUserPoint(userId, ticketId, pointDelta.toNumber());

          await trx("ticket").insert(newTicket);
          await trx("user_ticket_history").insert({
            userId,
            ticketId,
          });
          await trx("current_hash")
            .update({
              hashId: currentHash.hashId,
              hashIdx: currentHash.hashIdx + 1,
            })
            .where({
              gameId: 2,
            });

          await trx.commit();
          newTicket.meta = JSON.parse(newTicket.meta);
          resolve(newTicket as ITicketModel);
        } catch (e) {
          console.error(e);
          await trx.rollback();
          reject(e);
        }
      });
    });
  }
  public static async spendHgTicket(userId: string, userPickNum: number) {
    return new Promise((resolve, reject) => {
      db.transaction(async (trx) => {
        const unspendTicketList = await trx
          .select("*")
          .from("ticket")
          .innerJoin("user_ticket_history", "ticket.ticketId", "=", "user_ticket_history.ticketId")
          .where({
            "user_ticket_history.userId": userId,
            "ticket.gameId": 2,
            "ticket.isResultSet": false,
          });

        if (unspendTicketList.length === 0 || unspendTicketList.length > 1) {
          reject(new Error("Cannot find ticket"));
        }

        const unspendTicket = unspendTicketList[0];

        const meta: IHgMetadata = JSON.parse(unspendTicket.meta);
        const payout = meta.revealCardNumber + (meta.hiddenCardNumber % 2) === userPickNum ? 2 : 0;
        unspendTicket.payout = payout;
        unspendTicket.isResultSet = true;
        meta.userPick = userPickNum;
        unspendTicket.meta = JSON.stringify(meta);

        if (payout > 0) {
          await Platform.instance.updateUserPoint(userId, unspendTicket.ticketId, new Big(unspendTicket.betAmount).mul(payout).toNumber());
        }

        console.log(JSON.stringify(unspendTicket));
      });
    });
  }
}
