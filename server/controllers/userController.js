import { isValidMode, isValidCoordinate } from "../utils/validators.js";

// All handlers here operate only on req.user (the authenticated user
// attached by the `protect` middleware) — there is no way to target another
// user's account through these routes, since no user id is ever read from
// the URL or request body.

// @route  GET /api/users/me
// @access Private
export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// @route  PATCH /api/users/me
// @access Private
// Updates editable profile fields and/or location in one request.
// Email is intentionally not editable here — changing it would require
// re-verifying uniqueness and is out of scope for this MVP phase.
export const updateProfile = async (req, res) => {
  try {
    const { name, college, department, profilePicture, latitude, longitude } = req.body;
    const user = req.user;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      user.name = name.trim();
    }

    if (college !== undefined) {
      if (typeof college !== "string" || college.trim() === "") {
        return res.status(400).json({ message: "College cannot be empty" });
      }
      user.college = college.trim();
    }

    if (department !== undefined) {
      if (typeof department !== "string" || department.trim() === "") {
        return res.status(400).json({ message: "Department cannot be empty" });
      }
      user.department = department.trim();
    }

    if (profilePicture !== undefined) {
      // Allow clearing it with an empty string/null, otherwise expect a URL string.
      if (profilePicture !== null && typeof profilePicture !== "string") {
        return res.status(400).json({ message: "Profile picture must be a URL string" });
      }
      user.profilePicture = profilePicture ? profilePicture.trim() : null;
    }

    // Location is optional and only updated if both coordinates are sent.
    if (latitude !== undefined || longitude !== undefined) {
      if (!isValidCoordinate(latitude, longitude)) {
        return res.status(400).json({ message: "Invalid latitude/longitude" });
      }
      user.location = { latitude, longitude };
    }

    await user.save();

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  PATCH /api/users/me/mode
// @access Private
export const updateMode = async (req, res) => {
  try {
    const { mode } = req.body;

    if (!isValidMode(mode)) {
      return res.status(400).json({ message: 'Mode must be "REQUESTER" or "PROVIDER"' });
    }

    const user = req.user;
    user.mode = mode;
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
