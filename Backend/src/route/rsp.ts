import { Router } from "express";
import { spendByGameId } from "../util/random";

const router = Router();

router.get("/result", async (req, res) => {
  try {
    await spendByGameId(1, (hash) => {});
  } catch (e) {

  }
});

export default router;