import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { Knex } from 'knex';
import hashModel from '../model/hashModel';
import { IRspMetadata, ITicketModel } from '../model/ticketModel';
import Platform from "../util/platform";
import Big from 'big.js';

const defaultChainSize = 6000;

export const generateSeed = async (gameId: number, trx: Knex.Transaction) => {
  const lastHashIds = await trx('last_hash_id').select('*').forUpdate();
  let hashId = 1;
  if (lastHashIds.length > 0) {
    hashId = lastHashIds[0].hashId + 1;
  }
  const seed = uuidv4();
  const hashList: string[] = [];

  let prevHash: string = '';
  Array.from({ length: parseInt(process.env.HASH_CHAIN_SIZE?.toString() || defaultChainSize.toString()) }).forEach((_, idx) => {
    prevHash = crypto.createHmac('sha256', seed).update(prevHash).digest('hex');
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
      await trx('last_hash_id').update({ hashId }).where({ hashId: hashId - 1 });
    } else {
      await trx('last_hash_id').insert({ hashId });
    }
    
    return trx.raw(`
      INSERT INTO
        current_hash
      (gameId, hashId, hashIdx)
        VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        hashId = VALUES(hashId),
        hashIdx = VALUES(hashIdx)`, [ gameId, hashId, 0 ]);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const spendByGameId = async (
  gameId: number,
  betAmount: Big,
  userId: string,
  resultGenerateFunc: (hash: string) => { meta: IRspMetadata ,payout: number }): Promise<ITicketModel> => {
  return new Promise((resolve, reject) => {
    db.transaction(async (trx) => {
      try {
        let currentHashes = await trx('current_hash').select('*').where({
          gameId,
        }).forUpdate();
        let currentHash = currentHashes[0];

        if (currentHash.hashIdx >= parseInt(process.env.HASH_CHAIN_SIZE?.toString() || defaultChainSize.toString())) {
          await generateSeed(gameId, trx);
          currentHashes = await trx('current_hash').select('*').where({
            gameId,
          }).forUpdate();
          currentHash = currentHashes[0];
        }
        
        const hashString: string = await new Promise((resolve, reject) => {
          hashModel.get({id: currentHash.hashId}, async (err, data) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              const hashList: any = await data.get('hash');
              resolve(hashList[currentHash.hashIdx] as string);
            }
          });
        });
        
  
        const { meta, payout } = resultGenerateFunc(hashString);
        const ticketId = uuidv4();

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

        let pointDelta = 0;

        if (payout === 0) {
          pointDelta = -betAmount.toNumber();
        } else {
          pointDelta = betAmount.mul(payout).toNumber();
        }

        await Platform.instance.updateUserPoint(
          userId,
          ticketId,
          pointDelta,
        );
        await trx('ticket').insert(newTicket);
        await trx('user_ticket_history').insert({
          userId,
          ticketId,
        });
  
        await trx('current_hash').update({
          hashId: currentHash.hashId,
          hashIdx: currentHash.hashIdx + 1,
        }).where({
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