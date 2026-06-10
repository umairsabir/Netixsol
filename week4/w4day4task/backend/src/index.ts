import * as dotenv from "dotenv";
dotenv.config();
import * as Ably from "ably";
import roomsRouter from "./routes/rooms";
import messagesRouter from "./routes/messages";
import express from "express";
import http from "http";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const apiKey = process.env.ABLY_API_KEY;
const ably = apiKey ? new Ably.Realtime({ key: apiKey }) : null;

// Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Ably Auth endpoint
app.get("/api/ably-auth", async (req, res) => {
  if (!ably) return res.status(500).send("Ably not configured");
  const clientId = (req.query.clientId as string) || "anonymous";
  const tokenRequestData = await ably.auth.createTokenRequest({ clientId });
  res.json(tokenRequestData);
});

// REST routes
app.use("/api/rooms", roomsRouter);
app.use("/api/messages", messagesRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
