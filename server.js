import app from "./src/app.js";
import { connectDb } from "./src/config/db.js";
import "dotenv/config";

await connectDb();

const port = 3000;

app.listen(port, (req, res) => {
  console.log(`Server is active on port ${port}`);
});
