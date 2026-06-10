import { Router, Request, Response } from "express";
import { messages } from "../store";

const router = Router();

router.get("/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const roomMsgs = messages.get(roomId) ?? [];
  res.json(roomMsgs);
});

router.post("/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { id, username, text, timestamp } = req.body;
  const roomMsgs = messages.get(roomId) ?? [];
  roomMsgs.push({ id, roomId, username, text, timestamp });
  messages.set(roomId, roomMsgs);
  res.json({ success: true });
});

export default router;
