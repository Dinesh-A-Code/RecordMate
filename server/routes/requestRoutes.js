import express from "express";
import {
  createRequest,
  getMyRequests,
  getNearbyRequests,
  getAcceptedRequests,
  getRequestById,
  cancelRequest,
  acceptRequest,
  updateRequestStatus,
} from "../controllers/requestController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// NOTE: "/my", "/nearby", and "/accepted" are registered before "/:id" so
// Express doesn't treat those literal words as an :id value.
router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequests);
router.get("/nearby", protect, getNearbyRequests);
router.get("/accepted", protect, getAcceptedRequests);
router.get("/:id", protect, getRequestById);
router.patch("/:id/cancel", protect, cancelRequest);
router.patch("/:id/accept", protect, acceptRequest);
router.patch("/:id/status", protect, updateRequestStatus);

export default router;
