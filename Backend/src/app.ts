import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import Morgan from 'morgan';

import rspRouter from './route/rsp';

import ServerError from './util/serverError';

const app: Express = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(Morgan('dev'));
} else {
  app.use(Morgan('combined'));
}

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
