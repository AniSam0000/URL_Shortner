import express from "express";
// For handling file paths
import path from "path";
import { fileURLToPath } from "url";
import urlRoutes from "./routes/url.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookies from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookies());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// API routes
app.use("/api/user", userRoutes);
app.use("/api/url", urlRoutes);

// 3. Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// 4. Frontend fallback (LAST)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});
export default app;
