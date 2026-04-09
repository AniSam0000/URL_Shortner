import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/token.generator.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Generate a JWT token for the new user
    const token = generateToken(newUser);

    res.cookie("token", token, { httpOnly: true });

    // Return success response
    return res
      .status(201)
      .json({ message: "User registered successfully", newUser, token });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user" });
  }
};

// Login controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email and include the password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token for the logged-in user
    const token = generateToken(user);

    res.cookie("token", token, { httpOnly: true });

    // Return success response
    return res.json({ message: "User logged in successfully", token });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in user" });
  }
};

// Logout controller
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "User logged out successfully" });
};
