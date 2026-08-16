import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { isValidEmail, isValidPassword, getMissingFields } from "../utils/validators.js";

// @route  POST /api/auth/register
// @access Public
export const register = async (req, res) => {
  try {
    const { name, email, password, college, department } = req.body;

    const missing = getMissingFields(req.body, [
      "name",
      "email",
      "password",
      "college",
      "department",
    ]);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missing.join(", ")}`,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      college: college.trim(),
      department: department.trim(),
    });

    const token = generateToken(user._id);

    res.status(201).json({ user, token });
  } catch (err) {
    // Handle a race-condition duplicate-key error from the unique email index.
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missing = getMissingFields(req.body, ["email", "password"]);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missing.join(", ")}`,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Use the same generic message whether the email or password was wrong,
    // so we don't reveal which emails are registered.
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  GET /api/auth/me
// @access Private
export const getMe = async (req, res) => {
  // req.user is already the safe (passwordHash-stripped) user document,
  // attached by the `protect` middleware.
  res.json({ user: req.user });
};
