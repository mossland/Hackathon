import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import bluebird from 'bluebird';

const generateCount = 100000;

export const generateSeed = async (gameId: number) => {
  const lastHashId = await db('hash').select('*').where({
    gameId
  }).orderBy('hashId', 'desc').limit(1);
  
  let hashId = lastHashId.length > 0 ? lastHashId[0].hashId + generateCount : generateCount;
  let seed = uuidv4();

  return db.transaction(async (trx) => {
    try {
      await trx('seed').insert({
        hashId,
        seedString: seed,
      });

      let hash = crypto.createHash('sha256');

      await bluebird.each(
        Array.from({ length: generateCount }),
        async (_, idx) => {
          hash.update(seed);
          const curSeed = hash.copy().digest('hex');
          console.log(`hashId: ${hashId}
val: ${curSeed}`);
          await trx('hash').insert({
            gameId,
            hashId,
            key: curSeed,
            isSpend: false,
            isGenesis: idx === 0,
          });
          seed = curSeed;
          hashId -= 1;
        }
      );

      await trx.commit();
    } catch (e) {
      console.error(e);
      await trx.rollback();
    }
  });
}

export const spendByGameId = async (gameId: number, betAmount: number, resultGenerateFunc: (hash: string) => any) => {
  return new Promise((resolve, reject) => {
    db.transaction(async (trx) => {
      try {
        const hashes = await trx('hash').select('*').where({
          gameId,
          isSpend: false,
        }).orderBy('hashId', 'asc').limit(1);
        const spendingHash = hashes[0];
  
        const { meta, payout } = resultGenerateFunc(spendingHash.key);
        const ticketId = uuidv4();

        const newTicket = {
          gameId,
          hashId: spendingHash.hashId,
          ticketId,
          betAmount,
          payout,
          meta: JSON.stringify(meta),
        };
        await trx('ticket').insert(newTicket);
  
        await trx('hash').update({
          isSpend: true,
        }).where({
          hashId: spendingHash.hashId,
        });
  
        await trx.commit();

        newTicket.meta = meta;
        resolve(newTicket);
      } catch (e) {
        console.error(e);
        await trx.rollback();
        reject(e);
      }
    });
  });
  
};