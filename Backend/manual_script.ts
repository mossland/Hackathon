import { generateSeed } from './src/util/random';
import db from './src/db';
import { dbReset } from './test/db-reset';

(async () => {
  await dbReset();
})();