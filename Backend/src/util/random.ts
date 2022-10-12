import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import hashModel from '../model/hashModel';
import { IRspMetadata, ITicketModel } from '../model/ticketModel';

const generateCount = 6000;


export const generateSeed = async (gameId: number) => {
  const lastHashId = await db('current_hash').select('*').orderBy('hashId', 'desc').limit(1);

  let hashId = lastHashId.length > 0 ? lastHashId[0].hashId + 1 : 1;
  const seed = uuidv4();
  const hashList: string[] = [];

  let prevHash: string = '';
  Array.from({ length: generateCount }).forEach((_, idx) => {
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
    return db.raw(`
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

export const spendByGameId = async (gameId: number, betAmount: number, resultGenerateFunc: (hash: string) => { meta: IRspMetadata ,payout: number }): Promise<ITicketModel> => {
  return new Promise((resolve, reject) => {
    db.transaction(async (trx) => {
      try {
        let currentHashes = await trx('current_hash').select('*').where({
          gameId,
        }).forUpdate();
        let currentHash = currentHashes[0];

        if (currentHash.hashIdx >= generateCount) {
          await generateSeed(gameId);
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
          betAmount,
          payout,
          meta: JSON.stringify(meta),
        };
        await trx('ticket').insert(newTicket);
  
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