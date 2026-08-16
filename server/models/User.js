import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: [true, "College is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    mode: {
      type: String,
      enum: ["REQUESTER", "PROVIDER"],
      default: "REQUESTER",
    },
    location: {
      type: {
        latitude: Number,
        longitude: Number,
      },
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Instance method to check a plaintext password against the stored hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Never send passwordHash (or Mongo's internal __v) to the client, even
// accidentally — this runs whenever a User document is serialized to JSON.
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
