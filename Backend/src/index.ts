import path from 'path';
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});

import app from './app';
import dynamo from 'dynamodb';

dynamo.AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

app.listen(
  process.env.PORT,
  async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`);
  }
);