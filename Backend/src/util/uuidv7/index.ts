import v7 from './src/v7';
export interface IUuidv7Option {
  msecs?: number;
}

type TUuidv7 = (option?: IUuidv7Option) => string;
const uuidv7: TUuidv7 = v7;
export default uuidv7;