import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
const app: Express = express();

app.use(bodyParser);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

export default app;
