import { connectDb } from "./src/config/db.js";
import "dotenv/config";
import { connectRedis } from "./src/config/redis.config.js";

await connectRedis.connect();

// Import the app after connecting to Redis to ensure the connection is established before the app starts
const { default: app } = await import("./src/app.js");

try {
  // Connect to MongoDB
  await connectDb();
  console.log("✓ MongoDB connected successfully");
} catch (error) {
  console.error("✗ MongoDB connection failed:", error.message);
  process.exit(1); // Exit if MongoDB fails
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✓ Server is active on port ${port}`);
});
