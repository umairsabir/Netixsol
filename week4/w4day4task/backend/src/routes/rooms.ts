import { Router, Request, Response } from "express";
import { rooms } from "../store";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(rooms);
});

export default router;
