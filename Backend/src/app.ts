import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import Morgan from 'morgan';
import Big from 'big.js';

Big.DP = 1000000;
Big.RM = 0;
Big.NE = -1000000;
Big.PE = 1000000;

import rspRouter from './route/rsp';
import hgRouter from './route/hg';
import userRouter from './route/user';

import ServerError from './util/serverError';
import morgan from 'morgan';
import cors from 'cors';

const app: Express = express();

app.use(Morgan(`:remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status ":user-agent"  ":referrer" ":origin" - ":userId" ":userNickname"`));
morgan.token('userId', function(req, res) {
  if (!(res as any).locals.user) {
    return 'unknown';
  } else {
    return (res as any).locals.user.id
  }
});

morgan.token('userNickname', function(req, res) {
  if (!(res as any).locals.user) {
    return '';
  } else {
    return (res as any).locals.user.nickname
  }
});

morgan.token('remote-addr', function(req, res) {
  return (req as any).ip;
});

morgan.token('origin', function(req, res) {
  return req.headers.origin;
})

app.set('trust proxy', true);

const corsWhitelist: any[] = [];
app.use(cors({
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'production') {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  }
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/ping', (req, res) => { res.status(200).json({ success: true, message: 'pong' }) });
app.use('/user', userRouter);
app.use('/rsp', rspRouter);
app.use('/hg', hgRouter);

app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.code).json({
    success: false,
    message: err.message,
  });
});

export default app;