import bluebird from 'bluebird';
import db from '../src/db';
import hashModel from '../src/model/hashModel';
import { generateSeed } from '../src/util/random';

export const dbReset = async () => {
  console.log('[START] truncate db');
  await db('current_hash').truncate();
  await db('game').truncate();
  await db('ticket').truncate();
  await db('user_ticket_history').truncate();
  console.log('[END] truncate db');


  console.log('[START] insert data');
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
  console.log('[END] insert data');
  

  console.log('[START] reset hashchain');
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
  await generateSeed(1);
  console.log('[END] reset hashchain');
};
