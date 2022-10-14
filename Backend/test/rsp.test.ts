import path from 'path';
require('dotenv').config({
  path: path.join(__dirname, `../.env.test`),
});

import bluebird from 'bluebird';
import request from 'supertest';


import app from '../src/app';
import db from '../src/db';
import { dbReset } from './db-reset';
import Big from 'big.js';
import { StatusCodes } from 'http-status-codes';
import Platform from '../src/util/platform';
import { randomUUID } from 'crypto';

const testToken = process.env.TEST_TOKEN?.toString() || '';

describe('Test /rsp', () => {
  beforeAll(async () => {
    await dbReset();

    const userCurPoint = await Platform.instance.fetchUserPoint(process.env.TEST_USER_ID?.toString() || '');
    await Platform.instance.updateUserPoint(
      process.env.TEST_USER_ID?.toString() || '',
      randomUUID(),
      new Big(userCurPoint).mul(-1).toNumber(),
    );

    await Platform.instance.updateUserPoint(
      process.env.TEST_USER_ID?.toString() || '',
      randomUUID(),
      new Big(1000000).toNumber(),
    );
  });

  it ('empty body should return success false', async () => {
    await request(app).post('/rsp/result').set('Authorization', testToken).then((response) => {
      return expect(response.body.success).toBe(false);
    });
  });

  it ('invalid input should return success false', async () => {
    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      betAmount: 10,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 'a',
      betAmount: 10,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: -123,
      betAmount: 10,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 56,
      betAmount: 10,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: Infinity,
      betAmount: 10,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 2,
      betAmount: 'a',
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 2,
      betAmount: 0,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 2,
      betAmount: -23,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 2,
      betAmount: Infinity,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 2,
      betAmount: 30.5,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 1.5,
      betAmount: 10,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 1.5,
      betAmount: 10.4,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 1.5,
      betAmount: '10.4',
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: '1.5',
      betAmount: 10.4,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').set('Authorization', testToken).send({
      pick: 2,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });
  });

  it ('valid input should return success true', async () => {
    const prevUserPoint = await Platform.instance.fetchUserPoint(process.env.TEST_USER_ID?.toString() || '');
    let deltaPoint = new Big(0);
    const probability = {
      1: 0,
      2: 0,
      4: 0,
      7: 0,
      10: 0,
    };

    const testWinLoseByUserPick = {
      0: {
        win: 2,
        lose: 1,
        draw: 0,
      },
      1: {
        win: 0,
        lose: 2,
        draw: 1,
      },
      2: {
        win: 1,
        lose: 0,
        draw: 2,
      }
    };

    await bluebird.map(
      Array.from({length: 500}),
      async (_) => {
        const userPick = Math.floor(Math.random() * 81) % 3;
        
        await request(app)
        .post('/rsp/result')
        .set('Authorization', testToken)
        .send({
          pick: userPick,
          betAmount: 10,
        }).then(async (response) => {
          probability[response.body.ticket.meta.multiplier]++;
          if (response.body.ticket.meta.computerPick === testWinLoseByUserPick[userPick].draw) {
            expect(response.body.ticket.payout).toBe(1);
          } else if (response.body.ticket.meta.computerPick === testWinLoseByUserPick[userPick].lose) {
            expect(response.body.ticket.payout).toBe(0);
            deltaPoint = deltaPoint.minus(10);
          } else {
            expect(response.body.ticket.meta.computerPick).toBe(testWinLoseByUserPick[userPick].win);
            deltaPoint = deltaPoint.plus(new Big(10).mul(response.body.ticket.payout).minus(10));
          }
          return expect(response.body.success).toBe(true);
        });
      },
      { concurrency: 20 }
    );
    
    const nextUserPoint = await Platform.instance.fetchUserPoint(process.env.TEST_USER_ID?.toString() || '');
    const total = Object.keys(probability).reduce((sum, pKey) => {
      return sum + probability[pKey];
    }, 0)
    let floatProb = Object.keys(probability).reduce((acc, key) => {
      acc[key] = new Big(probability[key]).div(total).toString();
      return acc;
    }, {});

    return expect(nextUserPoint).toBe(new Big(prevUserPoint).plus(deltaPoint).toNumber());
  });

  it ('rsp ticket generate', async () => {
    await bluebird.each(
      Array.from({length: 81}),
      async (_) => {
        const pick = Math.floor(Math.random() * 81) % 3;
        await request(app).post('/rsp/result').set('Authorization', testToken).send({
          pick,
          betAmount: 10,
        }).set('Authorization', testToken).then(async (response) => {
          const tickets = await db('ticket').where({ticketId: response.body.ticket.ticketId})
          const ticket = tickets[0];
          ticket.meta = JSON.parse(ticket.meta);

          expect(ticket).toBeDefined();
          expect(ticket).toMatchObject(response.body.ticket);

          expect(ticket.meta.userPick).toBe(pick);
          const defaultPayoutResultByUserPick: { [keys: string]: any } = {
            '0': {
              0: 1,
              1: 0,
              2: parseInt(ticket.meta.multiplier),
            },
            '1': {
              0: parseInt(ticket.meta.multiplier),
              1: 1,
              2: 0,
            },
            '2': {
              0: 0,
              1: parseInt(ticket.meta.multiplier),
              2: 1,
            }
          };
          const payoutBig = new Big(defaultPayoutResultByUserPick[pick][ticket.meta.computerPick]);
          expect(ticket.payout).toBe(payoutBig.toNumber());
          return expect(response.body.success).toBe(true);
        });
      }
    );
  });

  it ('auto hash chain generate test', async () => {
    await dbReset();

    await bluebird.each(
      Array.from({length: 30}),
      async (_, hIdx) => {
        await request(app).post('/rsp/result').set('Authorization', testToken).send({
          pick: Math.floor(Math.random() * 81) % 3,
          betAmount: 10,
        }).then(async (response) => {
          const tickets = await db('ticket').where({ticketId: response.body.ticket.ticketId})
          const ticket = tickets[0];
          ticket.meta = JSON.parse(ticket.meta);
          expect(ticket.hashId).toEqual(Math.floor(hIdx / 10) + 1);

          const gameHashData = await db('current_hash').select('*').where({gameId: 1});
          expect(gameHashData[0].hashId).toEqual(Math.floor(hIdx / 10) + 1);
          const lastHashData = await db('last_hash_id').select('*');
          expect(lastHashData[0].hashId).toEqual(Math.floor(hIdx / 10) + 1);
          return expect(response.body.success).toBe(true);
        });
      }
    );
  });

  it ('should return success false when the status of game is unavailable', async () => {
    await db('game').update({isAvailable: false}).where({ gameId: 1 });
    await request(app)
      .post('/rsp/result')
      .set('Authorization', testToken)
      .send({
        pick: Math.floor(Math.random() * 81) % 3,
        betAmount: 10,
      }).then((response) => {
        return expect(response.body.success).toBe(false);
      });
  });

  it ('user auth test', async () => {
    await dbReset();
    await request(app)
      .post('/rsp/result')
      .set('Authorization', '')
      .send({
        pick: Math.floor(Math.random() * 81) % 3,
        betAmount: 10,
      }).then((response) => {
        expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        return expect(response.body.success).toBe(false);
      });
    await request(app)
      .post('/rsp/result')
      .set('Authorization', 'Bearer eyAbhGciOiJIUzI1NiIsInR5cCI6KipXVCJ1.eyJrZXlyaW5nIjoiNjMyOTdlNWZkMThmYtI5ZTUxYWQ5Y6UiIiwicm7sZSI6InVzFTKiLTBzdGF4fXMiOiJhY3RpdmUiLCJpYXQiOjE2NjM2NjM3MTF9.BDfnJsUB_x9qPj3I5PtcA3A7QtVZdFc01Ufyg2jziFh')
      .send({
        pick: Math.floor(Math.random() * 81) % 3,
        betAmount: 10,
      }).then((response) => {
        expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        return expect(response.body.success).toBe(false);
      });

      await request(app)
      .post('/rsp/result')
      .set('Authorization', testToken)
      .send({
        pick: Math.floor(Math.random() * 81) % 3,
        betAmount: 10,
      }).then((response) => {
        expect(response.statusCode).toEqual(StatusCodes.OK);
        return expect(response.body.success).toBe(true);
      });
  });
});