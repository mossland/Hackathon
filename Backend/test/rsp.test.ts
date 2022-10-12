import path from 'path';
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});

import bluebird from 'bluebird';
import request from 'supertest';


import app from '../src/app';
import db from '../src/db';
import { dbReset } from './db-reset';
import Big from 'big.js';

describe('Test /rsp', () => {
  beforeAll(async () => {
    await dbReset();
  });

  it ('empty body should return success false', async () => {
    await request(app).post('/rsp/result').then((response) => {
      return expect(response.body.success).toBe(false);
    });
  });

  it ('invalid input should return success false', async () => {
    await request(app).post('/rsp/result').send({
      betAmount: 100,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 'a',
      betAmount: 100,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: -123,
      betAmount: 100,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 56,
      betAmount: 100,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: Infinity,
      betAmount: 100,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 2,
      betAmount: 'a',
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 2,
      betAmount: 0,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 2,
      betAmount: -23,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 2,
      betAmount: Infinity,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 2,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });
  });

  it ('valid input should return success true', async () => {
    await bluebird.map(
      Array.from({length: 81}),
      async (_) => {
        await request(app).post('/rsp/result').send({
          pick: 0,
          betAmount: 100,
        }).then((response) => {
          if (response.body.ticket.meta.computerPick === 0) {
            expect(response.body.ticket.payout).toBe(1);
          } else if (response.body.ticket.meta.computerPick === 1) {
            expect(response.body.ticket.payout).toBe(0);
          } else {
            expect(response.body.ticket.meta.computerPick).toBe(2);
            expect(response.body.ticket.payout).toBeGreaterThanOrEqual(3);
            expect(response.body.ticket.payout % 3).toBe(0);
          }
          return expect(response.body.success).toBe(true);
        });
      }
    );

    await bluebird.map(
      Array.from({length: 81}),
      async (_) => {
        await request(app).post('/rsp/result').send({
          pick: 1,
          betAmount: 100,
        }).then((response) => {
          if (response.body.ticket.meta.computerPick === 1) {
            expect(response.body.ticket.payout).toBe(1);
          } else if (response.body.ticket.meta.computerPick === 2) {
            expect(response.body.ticket.payout).toBe(0);
          } else {
            expect(response.body.ticket.meta.computerPick).toBe(0);
            expect(response.body.ticket.payout).toBeGreaterThanOrEqual(3);
            expect(response.body.ticket.payout % 3).toBe(0);
          }
          return expect(response.body.success).toBe(true);
        });
      }
    );

    await bluebird.map(
      Array.from({length: 81}),
      async (_) => {
        await request(app).post('/rsp/result').send({
          pick: 2,
          betAmount: 100,
        }).then((response) => {
          if (response.body.ticket.meta.computerPick === 2) {
            expect(response.body.ticket.payout).toBe(1);
          } else if (response.body.ticket.meta.computerPick === 0) {
            expect(response.body.ticket.payout).toBe(0);
          } else {
            expect(response.body.ticket.meta.computerPick).toBe(1);
            expect(response.body.ticket.payout).toBeGreaterThanOrEqual(3);
            expect(response.body.ticket.payout % 3).toBe(0);
          }
          return expect(response.body.success).toBe(true);
        });
      }
    );
  });

  it ('rsp ticket generate', async () => {
    const ruleByUserPick: { [keys: string]: any } = {
      '0': {
        0: 1,
        1: 0,
        2: 3,
      },
      '1': {
        0: 3,
        1: 1,
        2: 0,
      },
      '2': {
        0: 0,
        1: 3,
        2: 1,
      }
    };


    await bluebird.each(
      Array.from({length: 81}),
      async (_) => {
        const pick = Math.floor(Math.random() * 81) % 3;
        await request(app).post('/rsp/result').send({
          pick,
          betAmount: 100,
        }).then(async (response) => {
          const tickets = await db('ticket').where({ticketId: response.body.ticket.ticketId})
          const ticket = tickets[0];
          ticket.meta = JSON.parse(ticket.meta);

          expect(ticket).toBeDefined();
          expect(ticket).toMatchObject(response.body.ticket);

          expect(ticket.meta.userPick).toBe(pick);
          const payoutBig = new Big(ruleByUserPick[pick][ticket.meta.computerPick]).mul(ticket.meta.multiplier);
          expect(ticket.payout).toBe(new Big(ruleByUserPick[pick][ticket.meta.computerPick]).eq(1) ? 1 : payoutBig.toNumber());
          return expect(response.body.success).toBe(true);
        });
      }
    );
  });

  it ('auto hash chain generate test', async () => {
    process.env['HASH_CHAIN_SIZE'] = '10';
    await dbReset();
    let curHashId = 1;
    await bluebird.each(
      Array.from({length: 30}),
      async (_, hIdx) => {
        await request(app).post('/rsp/result').send({
          pick: Math.floor(Math.random() * 81) % 3,
          betAmount: 100,
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
});