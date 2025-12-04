import { Request, Response, NextFunction } from "express";
import StatusCodes from "http-status-codes";
import ServerError from "../util/serverError";
import db from "../db";
import Big from "big.js";

Big.RM = 0;

function isInteger(value: any) {
  if (typeof value === typeof 1) {
    return isFinite(value) && Math.floor(value) === value;
  } else {
    try {
      return new Big(value).eq(new Big(value).round());
    } catch (e) {
      return false;
    }
  }
}
export const validateBetAmount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const betAmount = new Big(req.body.betAmount);
    if (isNaN(betAmount.toNumber())) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }
    if (betAmount.lte(0)) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }
    next();
  } catch (e) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
};
export const validateRSPGameInput = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body.pick === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (!isInteger(req.body.pick) || !isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const pick = new Big(req.body.pick);
  const betAmount = new Big(req.body.betAmount);

  if (isNaN(pick.toNumber()) || isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validatePizzaRevolutionGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const pizzaRevolutionGameId = 5;
  if (req.body.gameId !== pizzaRevolutionGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  try {
    const betAmount = new Big(req.body.betAmount);
    if (isNaN(betAmount.toNumber())) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }

    if (betAmount.lte(0)) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }

    if (betAmount.gt(100000)) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }
  } catch (e) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const userPickNumber = parseInt(req.body.userPickNumber);
  const userPickColor = parseInt(req.body.userPickColor);

  if (!userPickNumber && !userPickColor) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (userPickNumber !== 0 && userPickColor !== 0) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (userPickNumber < 0 || userPickNumber > 8) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (userPickColor !== 0 && userPickColor !== 1 && userPickColor !== 2) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateL7DGameInput = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body.pick === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (!["over", "seven", "under"].includes(req.body.pick) || !isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const pick = req.body.pick;
  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateHeadsOrTailsGameInput = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body.pick === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  // 0 heads, 1 tails
  if (![0, 1].includes(req.body.pick)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (!isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateGemQuestGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const gemQuestGameId = 6;
  if (req.body.gameId !== gemQuestGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateDoubleDiceGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const doubleDiceGameId = 7;
  if (req.body.gameId !== doubleDiceGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (typeof req.body.pick === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (!["blue", "tie", "red"].includes(req.body.pick) || !isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const pick = req.body.pick;
  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateOneTwoThreeGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const oneTwoThreeGameId = 10;
  if (req.body.gameId !== oneTwoThreeGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (
    typeof req.body.winNumber === typeof undefined ||
    typeof req.body.tieNumber === typeof undefined ||
    typeof req.body.betAmount === typeof undefined
  ) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (
    req.body.winNumber < 0 ||
    req.body.winNumber > 3 ||
    req.body.tieNumber < 0 ||
    req.body.tieNumber > 3 ||
    req.body.winNumber === req.body.tieNumber ||
    !isInteger(req.body.betAmount)
  ) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateDianmondAndBombGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const dianmondAndBombGameId = 8;
  if (req.body.gameId !== dianmondAndBombGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (
    typeof req.body.pick === typeof undefined ||
    typeof req.body.diaCount === typeof undefined ||
    typeof req.body.betAmount === typeof undefined
  ) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (req.body.pick < 0 || req.body.pick > 24 || !isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (req.body.diaCount < 1 || req.body.diaCount > 24 || !isInteger(req.body.diaCount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateHorseRaceGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const horseRaceGameId = 9;
  if (req.body.gameId !== horseRaceGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (typeof req.body.pick === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (req.body.pick < 0 || req.body.pick > 3 || !isInteger(req.body.betAmount)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (!Array.isArray(req.body.topCards) || req.body.topCards.length !== 7) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  const typeCount = [0, 0, 0, 0];
  for (let i = 0; i < req.body.topCards.length; i++) {
    const t = req.body.topCards[i]?.type;

    if (!Number.isInteger(t) || t < 0 || t > 3) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }

    typeCount[t] += 1;

    if (typeCount[t] > 4) {
      return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
    }
  }

  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }
  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid input"));
  }

  next();
};

export const validateKenoGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const kenoGameId = 11;

  if (req.body.gameId !== kenoGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid gameId"));
  }

  if (typeof req.body.userNumbers === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Missing required fields: userNumbers or betAmount"));
  }

  if (!Array.isArray(req.body.userNumbers) || req.body.userNumbers.length <= 0 || req.body.userNumbers.length > 8) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "userNumbers must be an array with 1–8 items"));
  }

  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "betAmount must be a valid number"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "betAmount must be greater than 0"));
  }

  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "betAmount must be ≤ 100000"));
  }

  next();
};

export const validateLuckyMatchGameInput = async (req: Request, res: Response, next: NextFunction) => {
  const luckyMatchGameId = 12;

  const MatchType = {
    Inside: "inside",
    Outside: "outside",
    Range_1: "range_1",
    Range_2: "range_2",
    Range_3: "range_3",
    Range_4: "range_4",
  } as const;

  if (req.body.gameId !== luckyMatchGameId) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Invalid gameId"));
  }

  if (typeof req.body.matchType === typeof undefined || typeof req.body.betAmount === typeof undefined) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Missing required fields: userNumbers or betAmount"));
  }

  if (
    typeof req.body.matchType !== "string" ||
    !Object.values(MatchType).includes(req.body.matchType as (typeof MatchType)[keyof typeof MatchType])
  ) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, `matchType must be one of: ${Object.values(MatchType).join(", ")}`));
  }

  const betAmount = new Big(req.body.betAmount);

  if (isNaN(betAmount.toNumber())) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "betAmount must be a valid number"));
  }

  if (betAmount.lte(0)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "betAmount must be greater than 0"));
  }

  if (betAmount.gt(100000)) {
    return next(new ServerError(StatusCodes.BAD_REQUEST, "betAmount must be ≤ 100000"));
  }

  next();
};

export const createGameStateValidator = (gameId: number): ((req: Request, res: Response, next: NextFunction) => any) => {
  const gameIdObj = {
    "1": "rsp",
    "2": "hg",
    "3": "l7d",
    "4": "headsOrTails",
    "5": "pizzaRevolution",
    "6": "gemQuest",
    "7": "doubleDice",
    "8": "diamondAndBomb",
    "9": "horseRace",
    "10": "diamondAndBomb",
    "11": "keno",
    "12": "luckyMatch",
  };

  if (Object.keys(gameIdObj).indexOf(gameId.toString()) !== -1) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const selectGame = (await db("game").select("*").where("gameId", gameId))[0];
      if (selectGame?.isAvailable) {
        next();
      } else {
        return next(new ServerError(StatusCodes.FORBIDDEN, "the game is not available now"));
      }
    };
  } else {
    return (req: Request, res: Response, next: NextFunction) => {
      return next(new ServerError(StatusCodes.FORBIDDEN, "the game is not available now"));
    };
  }
};
