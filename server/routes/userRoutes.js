import express from "express";
import { getProfile, updateProfile, updateMode } from "../controllers/userController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Every route here requires a valid JWT and always acts on the
// authenticated user's own account.
router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);
router.patch("/me/mode", protect, updateMode);

export default router;
