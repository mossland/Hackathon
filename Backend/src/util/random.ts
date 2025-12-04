import crypto from "crypto";
import uuidv7 from "../util/uuidv7";
import db from "../db";
import { Knex } from "knex";
import hashModel from "../model/hashModel";
import {
  IRspMetadata,
  IL7DMetadata,
  ITicketModel,
  IHeadsOrTailsMetadata,
  IPizzaRevolutionMetadata,
  IGemQuestMetadata,
  IDoubleDiceMetadata,
  IDianmondAndBombMetadata,
  IHorseRaceMetadata,
  IOneTwoThreeMetadata,
  IKenoMetadata,
  ILuckyMatchMetadata,
} from "../model/ticketModel";
import Platform from "../util/platform";
import Big from "big.js";

const defaultChainSize = 6000;

export const generateSeed = async (gameId: number, trx: Knex.Transaction) => {
  const lastHashIds = await trx("last_hash_id").select("*").forUpdate();
  let hashId = 1;
  if (lastHashIds.length > 0) {
    hashId = lastHashIds[0].hashId + 1;
  }
  const seed = crypto.randomBytes(32).toString("hex");
  const hashList: string[] = [];

  let prevHash: string = "";
  Array.from({ length: parseInt(process.env.HASH_CHAIN_SIZE?.toString() || defaultChainSize.toString()) }).forEach((_, idx) => {
    prevHash = crypto.createHmac("sha256", seed).update(prevHash).digest("hex");
    hashList.push(prevHash);
  });

  try {
    await new Promise((resolve, reject) => {
      hashModel.create(
        {
          id: hashId,
          seed,
          hash: hashList.reverse(),
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });

    if (hashId !== 1) {
      await trx("last_hash_id")
        .update({ hashId })
        .where({ hashId: hashId - 1 });
    } else {
      await trx("last_hash_id").insert({ hashId });
    }

    return trx.raw(
      `
      INSERT INTO
        current_hash
      (gameId, hashId, hashIdx)
        VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        hashId = VALUES(hashId),
        hashIdx = VALUES(hashIdx)`,
      [gameId, hashId, 0]
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const generateHashString = async (trx: Knex.Transaction, gameId: number) => {
  let currentHashes = await trx("current_hash")
    .select("*")
    .where({
      gameId,
    })
    .forUpdate();

  let currentHash = currentHashes[0];
  let hashList: string[] = [];

  if (currentHash.hashId >= 0) {
    hashList = await new Promise((resolve, reject) => {
      hashModel.get({ id: currentHash.hashId }, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const rawHashList: any = await (data as any).get("hash");
          resolve(rawHashList);
        }
      });
    });
    if (currentHash.hashIdx >= hashList.length) {
      await generateSeed(gameId, trx);
      currentHashes = await trx("current_hash")
        .select("*")
        .where({
          gameId,
        })
        .forUpdate();
      currentHash = currentHashes[0];

      hashList = await new Promise((resolve, reject) => {
        hashModel.get({ id: currentHash.hashId }, async (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            const rawHashList: any = await (data as any).get("hash");
            resolve(rawHashList);
          }
        });
      });
    }
  } else {
    await generateSeed(gameId, trx);
    currentHashes = await trx("current_hash")
      .select("*")
      .where({
        gameId,
      })
      .forUpdate();
    currentHash = currentHashes[0];
    hashList = await new Promise((resolve, reject) => {
      hashModel.get({ id: currentHash.hashId }, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const rawHashList: any = await (data as any).get("hash");
          resolve(rawHashList);
        }
      });
    });
  }

  return { currentHash, hashString: hashList[currentHash.hashIdx] };
};

export const spendByGameId = async (
  gameId: number,
  betAmount: Big,
  userId: string,
  resultGenerateFunc: (hash: string) => {
    meta:
      | IRspMetadata
      | IL7DMetadata
      | IHeadsOrTailsMetadata
      | IPizzaRevolutionMetadata
      | IGemQuestMetadata
      | IDoubleDiceMetadata
      | IDianmondAndBombMetadata
      | IHorseRaceMetadata
      | IOneTwoThreeMetadata
      | IKenoMetadata
      | ILuckyMatchMetadata;
    payout: number;
  }
): Promise<ITicketModel> => {
  return new Promise((resolve, reject) => {
    db.transaction(async (trx) => {
      try {
        const { currentHash, hashString }: { currentHash: any; hashString: string } = await generateHashString(trx, gameId);
        const { meta, payout } = resultGenerateFunc(hashString);
        const ticketId = uuidv7();

        const newTicket: any = {
          gameId,
          hashId: currentHash.hashId,
          hashIdx: currentHash.hashIdx,
          hashString,
          ticketId,
          betAmount: betAmount.toNumber(),
          payout,
          meta: JSON.stringify(meta),
        };

        let pointDelta = betAmount.mul(-1);
        pointDelta = pointDelta.plus(betAmount.mul(payout));

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
            gameId,
          });

        await trx.commit();

        newTicket.meta = meta;
        resolve(newTicket as ITicketModel);
      } catch (e) {
        console.error(e);
        await trx.rollback();
        reject(e);
      }
    });
  });
};
