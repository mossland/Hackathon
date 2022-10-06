import dynamo from 'dynamodb';
import joi from 'joi';

export default dynamo.define('Hash', {
  hashKey: 'id',
  timestamps: true,
  schema: {
    id: joi.number(),
    seed: joi.string().uuid(),
    hash: joi.array(),
  },
  tableName: process.env.AWS_DYNAMO_HASH_TABLE_NAME!.toString(),
});