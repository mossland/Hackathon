import bluebird from 'bluebird';
import db from '../src/db';
import hashModel from '../src/model/hashModel';
import { generateSeed } from '../src/util/random';

export const dbReset = async () => {
  await db('last_hash_id').truncate();
  await db('current_hash').truncate();
  await db('game').truncate();
  await db('ticket').truncate();
  await db('user_ticket_history').truncate();


  await db('game').insert({
    gameId: 1,
    name: `Rock,Paper,Scissors`,
    isAvailable: 1,
  });
  await db('current_hash').insert({
    gameId: 1,
    hashId: 0,
    hashIdx: 0,
  });
  

  const maxId: number = await new Promise((resolve, reject) => {
    hashModel.scan().loadAll().exec(async (err, data) => {
      resolve(data.Count);
    });
  })
  await bluebird.each(Array.from({ length: maxId }), async (_, idx) => {
    await new Promise((reso, reje) => {
      hashModel.destroy({id: idx + 1}, (err, data) => {
        reso(data);
      });
    });
  });
  await db.transaction(async (trx) => {
    try {
      await generateSeed(1, trx);
      await trx.commit();
    } catch (e) {
      console.error(e);
      await trx.rollback();
    }
  });
};
