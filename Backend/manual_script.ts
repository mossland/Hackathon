import { generateSeed } from './src/util/random';
import db from './src/db';

(async () => {
  await db.transaction(async (trx) => {
    try {
      await generateSeed(1, trx);
      await trx.commit();
    } catch (e) {
      await trx.rollback();
    }
  });
})();