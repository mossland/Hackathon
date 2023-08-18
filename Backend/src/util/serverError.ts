import StatusCodes from 'http-status-codes';

export default class ServerError extends Error {
  public code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}