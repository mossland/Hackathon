import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import Morgan from 'morgan';

import rspRouter from './route/rsp';

import ServerError from './util/serverError';
import morgan from 'morgan';

const app: Express = express();

app.use(Morgan(`:remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status ":referrer" ":user-agent" - ":userId"`));
morgan.token('userId', function(req, res) {
  if (!(res as any).locals.user) {
    return 'unknown';
  } else {
    return (res as any).locals.user.id
  }
});

morgan.token('remote-addr', function(req, res) {
  return (req as any).ip;
});

app.set('trust proxy', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/rsp', rspRouter);

app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.code).json({
    success: false,
    message: err.message,
  });
});

export default app;
