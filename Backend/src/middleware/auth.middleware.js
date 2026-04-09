import jsonwebtoken from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to authenticate user using JWT token
export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const token = req.cookies.token || bearerToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    // Verify the token and extract user information
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
