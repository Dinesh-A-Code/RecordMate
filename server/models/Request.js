import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    recordType: {
      type: String,
      required: [true, "Record type is required"],
      trim: true,
      maxlength: 100,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 100,
    },
    pages: {
      type: Number,
      required: [true, "Number of pages is required"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    payment: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radius: {
      type: Number,
      required: [true, "Search radius is required"],
    },
    // Phase 6 adds the full task lifecycle: OPEN -> ACCEPTED -> IN_PROGRESS
    // -> COMPLETED, plus CANCELLED (only reachable from OPEN). Both
    // CANCELLED and COMPLETED are terminal — no further transitions.
    status: {
      type: String,
      enum: ["OPEN", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

// Common query patterns: "my open/cancelled requests" and
// "my accepted tasks" (provider side).
requestSchema.index({ requesterId: 1, status: 1 });
requestSchema.index({ providerId: 1, status: 1 });

const Request = mongoose.model("Request", requestSchema);

export default Request;
