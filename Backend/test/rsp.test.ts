import path from 'path';
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});


import request from 'supertest';
import app from '../src/app';

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
      pick: 3,
      betAmount: 'a',
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 3,
      betAmount: 0,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 3,
      betAmount: -23,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });

    await request(app).post('/rsp/result').send({
      pick: 3,
    }).then((response) => {
      return expect(response.body.success).toBe(false);
    });
  });
});