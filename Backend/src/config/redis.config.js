import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const connectRedis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 10646,
  },
});

connectRedis.on("error", (err) => {
  console.error("Redis Client Error", err);
});
