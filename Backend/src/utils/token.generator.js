import jsonwebtoken from "jsonwebtoken";

// Function to generate JWT token for a user
export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m", // Token expires in 15 minutes
  });
};
