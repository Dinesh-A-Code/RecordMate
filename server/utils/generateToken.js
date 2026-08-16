import jwt from "jsonwebtoken";

// Signs a JWT containing the user's id. Kept as a single shared helper so
// token shape/expiry only need to be changed in one place.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
