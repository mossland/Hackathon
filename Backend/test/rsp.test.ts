import path from 'path';
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});


import request from 'supertest';
import app from '../src/app';
import bluebird from 'bluebird';

describe('Test /rsp', () => {
  it ('empty body should return success false', (done) => {
    request(app).post('/rsp/result').then((response) => {
      expect(response.body.success).toBe(false);
      done();
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
    await bluebird.each(
      Array.from({length: 81}),
      async (_) => {
        return request(app).post('/rsp/result').send({
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

    await bluebird.each(
      Array.from({length: 81}),
      async (_) => {
        return request(app).post('/rsp/result').send({
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

    await bluebird.each(
      Array.from({length: 81}),
      async (_) => {
        return request(app).post('/rsp/result').send({
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
});