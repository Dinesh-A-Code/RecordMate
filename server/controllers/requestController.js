import mongoose from "mongoose";
import Request from "../models/Request.js";
import { calculateDistanceKm } from "../utils/distance.js";
import { emitToUser, emitToAll } from "../socket.js";
import {
  getMissingFields,
  isPositiveInteger,
  isNonNegativeNumber,
  isValidRadius,
  isReasonableLength,
  isValidCoordinate,
  parseFutureOrTodayDate,
  MAX_RADIUS_KM,
} from "../utils/validators.js";

// Shape returned to a PROVIDER browsing/viewing someone else's request —
// deliberately excludes exact coordinates, radius, and any requester
// identity beyond their college. Used for the nearby list, the accepted-
// tasks list, and the provider-facing branches of getRequestById, so
// there's exactly one place that decides what a provider can see.
// distanceKm is optional — omitted when there's nothing to compute it from
// (e.g. provider has no current saved location) or when it's not relevant
// (accepted-tasks list).
const buildPublicRequestView = (request, distanceKm) => {
  const view = {
    id: request._id,
    recordType: request.recordType,
    subject: request.subject,
    pages: request.pages,
    deadline: request.deadline,
    payment: request.payment,
    description: request.description,
    college: request.requesterId?.college || null,
    status: request.status,
  };
  if (typeof distanceKm === "number") {
    view.distanceKm = Math.round(distanceKm * 10) / 10;
  }
  return view;
};

// Only IN_PROGRESS and COMPLETED are reachable through the generic status
// endpoint, each from exactly one prior status. OPEN -> ACCEPTED goes
// through the dedicated /accept endpoint; CANCELLED/COMPLETED are terminal
// and simply don't appear as a value here, so any attempt to reach them
// (or to move away from them) is rejected.
const REQUIRED_PRIOR_STATUS = {
  IN_PROGRESS: "ACCEPTED",
  COMPLETED: "IN_PROGRESS",
};

// Payload for the "request:updated" socket event sent to the requester
// after an accept or status change. Only fields already visible in the
// existing Phase 6 owner view of a request — nothing new is exposed here.
const buildRequestUpdateEvent = (request) => ({
  requestId: request._id,
  recordType: request.recordType,
  subject: request.subject,
  status: request.status,
  provider: request.providerId
    ? { name: request.providerId.name, college: request.providerId.college }
    : null,
});

// @route  POST /api/requests
// @access Private (REQUESTER mode only)
export const createRequest = async (req, res) => {
  try {
    // Mode is enforced server-side — the frontend also hides the "Create
    // Request" option from providers, but that's UX only, not security.
    if (req.user.mode !== "REQUESTER") {
      return res.status(403).json({
        message: "Only users in REQUESTER mode can create a record request",
      });
    }

    const {
      recordType,
      subject,
      pages,
      deadline,
      payment,
      description,
      latitude,
      longitude,
      radius,
    } = req.body;

    const missing = getMissingFields(req.body, [
      "recordType",
      "subject",
      "pages",
      "deadline",
      "payment",
      "latitude",
      "longitude",
      "radius",
    ]);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missing.join(", ")}`,
      });
    }

    if (!isReasonableLength(recordType, 100)) {
      return res.status(400).json({ message: "Record type must be 1-100 characters" });
    }

    if (!isReasonableLength(subject, 100)) {
      return res.status(400).json({ message: "Subject must be 1-100 characters" });
    }

    if (!isPositiveInteger(pages)) {
      return res.status(400).json({ message: "Pages must be a positive whole number" });
    }

    const deadlineDate = parseFutureOrTodayDate(deadline);
    if (!deadlineDate) {
      return res.status(400).json({ message: "Deadline must be a valid date not in the past" });
    }

    if (!isNonNegativeNumber(payment)) {
      return res.status(400).json({ message: "Payment must be a non-negative number" });
    }

    if (description !== undefined && description !== "" && typeof description === "string") {
      if (description.trim().length > 1000) {
        return res.status(400).json({ message: "Description must be under 1000 characters" });
      }
    } else if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ message: "Description must be text" });
    }

    if (!isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({ message: "Invalid latitude/longitude" });
    }

    if (!isValidRadius(radius)) {
      return res.status(400).json({
        message: `Radius must be a positive number up to ${MAX_RADIUS_KM} km`,
      });
    }

    const request = await Request.create({
      requesterId: req.user._id,
      providerId: null,
      recordType: recordType.trim(),
      subject: subject.trim(),
      pages,
      deadline: deadlineDate,
      payment,
      description: description ? description.trim() : "",
      location: { latitude, longitude },
      radius,
      status: "OPEN",
    });

    res.status(201).json({ request });

    // Emitted only after the write above has already succeeded and the
    // response is on its way — a socket failure here can never affect the
    // REST result. Payload deliberately carries no requesterId, coordinates,
    // or other private data; connected clients react by refetching
    // /api/requests/nearby, which independently re-applies the real
    // eligibility rules (radius, OPEN status, college filter).
    emitToAll("request:new", {
      requestId: request._id,
      recordType: request.recordType,
      subject: request.subject,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  GET /api/requests/nearby
// @access Private (PROVIDER mode only)
// Query params: collegeMode=same|all (default "same"), sort=distance|payment|deadline (default "distance")
export const getNearbyRequests = async (req, res) => {
  try {
    if (req.user.mode !== "PROVIDER") {
      return res.status(403).json({
        message: "Only users in PROVIDER mode can search nearby requests",
      });
    }

    if (!req.user.location) {
      return res.status(400).json({
        message: "Please update your location before searching for nearby requests",
      });
    }

    const collegeMode = req.query.collegeMode === "all" ? "all" : "same";
    const sortBy = ["distance", "payment", "deadline"].includes(req.query.sort)
      ? req.query.sort
      : "distance";

    const { latitude, longitude } = req.user.location;

    // Broad candidate set: OPEN requests not created by this provider.
    // Distance/radius filtering happens in application code below — fine
    // for MVP scale (see Phase 5 spec, section 7).
    const openRequests = await Request.find({
      status: "OPEN",
      requesterId: { $ne: req.user._id },
    }).populate("requesterId", "college");

    let matches = openRequests
      .filter(
        (request) =>
          request.location &&
          isValidCoordinate(request.location.latitude, request.location.longitude)
      )
      .map((request) => ({
        request,
        distanceKm: calculateDistanceKm(
          latitude,
          longitude,
          request.location.latitude,
          request.location.longitude
        ),
      }))
      .filter(({ request, distanceKm }) => distanceKm <= request.radius);

    if (collegeMode === "same") {
      matches = matches.filter(({ request }) => request.requesterId?.college === req.user.college);
    }

    matches.sort((a, b) => {
      if (sortBy === "payment") return b.request.payment - a.request.payment;
      if (sortBy === "deadline") return new Date(a.request.deadline) - new Date(b.request.deadline);
      return a.distanceKm - b.distanceKm;
    });

    const requests = matches.map(({ request, distanceKm }) =>
      buildPublicRequestView(request, distanceKm)
    );

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  PATCH /api/requests/:id/accept
// @access Private (PROVIDER mode only)
export const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    if (req.user.mode !== "PROVIDER") {
      return res.status(403).json({ message: "Only users in PROVIDER mode can accept requests" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requesterId.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot accept your own request" });
    }

    if (!req.user.location) {
      return res.status(400).json({
        message: "Please update your location before accepting requests",
      });
    }

    if (!isValidCoordinate(request.location?.latitude, request.location?.longitude)) {
      return res.status(400).json({ message: "This request has invalid location data" });
    }

    // Same eligibility rule as Phase 5's nearby matching: must be within
    // the request's radius. Checked here (using the values already read
    // above) before we attempt the write.
    const distanceKm = calculateDistanceKm(
      req.user.location.latitude,
      req.user.location.longitude,
      request.location.latitude,
      request.location.longitude
    );

    if (distanceKm > request.radius) {
      return res.status(403).json({ message: "This request is outside your matching radius" });
    }

    // The actual concurrency guard: this update only succeeds if the
    // request's status is STILL "OPEN" at the moment MongoDB applies it.
    // If two providers race here, only the first write to reach MongoDB
    // matches the filter — the second finds status no longer "OPEN" and
    // matches nothing, so findOneAndUpdate returns null for them. This is
    // atomic at the document level, so no read-check-write gap exists.
    const accepted = await Request.findOneAndUpdate(
      { _id: id, status: "OPEN" },
      { $set: { providerId: req.user._id, status: "ACCEPTED" } },
      { new: true }
    )
      .populate("requesterId", "name college department rating")
      .populate("providerId", "name college department rating");

    if (!accepted) {
      const current = await Request.findById(id).select("status");
      if (current?.status === "CANCELLED") {
        return res.status(409).json({
          message: "This request has been cancelled and can no longer be accepted.",
        });
      }
      return res.status(409).json({ message: "This request is no longer available." });
    }

    res.json({ request: accepted });

    // Same principle as createRequest: emitted only after the write above
    // has already succeeded. Targeted at exactly the requester who owns
    // this request via their private room — no other connected user
    // receives this event.
    emitToUser(accepted.requesterId._id, "request:updated", buildRequestUpdateEvent(accepted));

    // Broadcast too — this is how other providers currently browsing
    // Nearby Requests learn this specific id just left the OPEN pool, so
    // their list can drop it. Payload is a bare id, nothing sensitive.
    emitToAll("request:unavailable", { requestId: accepted._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  PATCH /api/requests/:id/status
// @access Private (assigned PROVIDER only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    if (req.user.mode !== "PROVIDER") {
      return res.status(403).json({ message: "Only the assigned provider can update task status" });
    }

    const requiredPriorStatus = REQUIRED_PRIOR_STATUS[targetStatus];
    if (!requiredPriorStatus) {
      return res.status(400).json({ message: 'Status must be "IN_PROGRESS" or "COMPLETED"' });
    }

    // Atomic conditional update, same pattern as acceptRequest: only
    // applies if this provider is assigned AND the request is still in the
    // exact prior status this transition requires.
    const updated = await Request.findOneAndUpdate(
      { _id: id, providerId: req.user._id, status: requiredPriorStatus },
      { $set: { status: targetStatus } },
      { new: true }
    )
      .populate("requesterId", "name college department rating")
      .populate("providerId", "name college department rating");

    if (updated) {
      res.json({ request: updated });
      emitToUser(updated.requesterId._id, "request:updated", buildRequestUpdateEvent(updated));
      return;
    }

    // Update matched nothing — figure out why, for a precise message.
    const existing = await Request.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (!existing.providerId || existing.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not assigned to this request" });
    }
    return res.status(400).json({
      message: `Cannot change status from ${existing.status} to ${targetStatus}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  GET /api/requests/my
// @access Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("providerId", "name college department rating");
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  GET /api/requests/accepted
// @access Private (provider's own accepted/in-progress/completed tasks)
export const getAcceptedRequests = async (req, res) => {
  try {
    const tasks = await Request.find({ providerId: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("requesterId", "college");

    res.json({ requests: tasks.map((task) => buildPublicRequestView(task)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  GET /api/requests/:id
// @access Private
// - Owner sees the full request (including populated assigned provider).
// - The assigned provider sees a restricted view (no exact coordinates).
// - Any other provider only sees a restricted view if the request is still
//   OPEN and within their matching radius (same rule as /nearby).
// - Everyone else gets 403 — once a request leaves OPEN, only the owner
//   and the assigned provider can look it up by id.
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await Request.findById(id)
      .populate("requesterId", "college")
      .populate("providerId", "name college department rating");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isOwner = request.requesterId._id.toString() === req.user._id.toString();
    if (isOwner) {
      return res.json({ request });
    }

    const isAssignedProvider =
      request.providerId && request.providerId._id.toString() === req.user._id.toString();
    if (isAssignedProvider) {
      // Still never send exact coordinates, even to the assigned provider —
      // only recompute a fresh distance if they currently have a location.
      let distanceKm;
      if (req.user.location && isValidCoordinate(request.location.latitude, request.location.longitude)) {
        distanceKm = calculateDistanceKm(
          req.user.location.latitude,
          req.user.location.longitude,
          request.location.latitude,
          request.location.longitude
        );
      }
      return res.json({ request: buildPublicRequestView(request, distanceKm) });
    }

    // Not the owner, not the assigned provider — only an eligible provider
    // may view this, and only while it's still OPEN. Once it moves past
    // OPEN, no other provider can reach it here, even by guessing the id.
    if (req.user.mode !== "PROVIDER" || request.status !== "OPEN") {
      return res.status(403).json({ message: "You do not have access to this request" });
    }

    if (!req.user.location) {
      return res.status(400).json({
        message: "Please update your location before viewing nearby requests",
      });
    }

    const distanceKm = calculateDistanceKm(
      req.user.location.latitude,
      req.user.location.longitude,
      request.location.latitude,
      request.location.longitude
    );

    if (distanceKm > request.radius) {
      return res.status(403).json({ message: "You do not have access to this request" });
    }

    res.json({ request: buildPublicRequestView(request, distanceKm) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @route  PATCH /api/requests/:id/cancel
// @access Private (owner only)
export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have access to this request" });
    }

    // Atomic, same reasoning as acceptRequest: closes the race where a
    // provider accepts at almost the same moment the requester cancels.
    const cancelled = await Request.findOneAndUpdate(
      { _id: id, requesterId: req.user._id, status: "OPEN" },
      { $set: { status: "CANCELLED" } },
      { new: true }
    );

    if (!cancelled) {
      return res.status(400).json({ message: "Only open requests can be cancelled" });
    }

    res.json({ request: cancelled });

    // Same reasoning as acceptRequest — a cancelled request should also
    // vanish from any provider's Nearby Requests list in real time.
    emitToAll("request:unavailable", { requestId: cancelled._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
