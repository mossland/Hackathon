export interface ITicketModel {
  gameId: number;
  hashId: number;
  hashIdx: number;
  hashString: string;
  ticketId: string;
  betAmount: number;
  payout: number;
  meta: IRspMetadata;
}

export interface IRspMetadata {
  hash: string;
  userPick: number;
  computerPick: number;
  multiplier: number;
}