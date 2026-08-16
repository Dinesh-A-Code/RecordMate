import mongoose from "mongoose";

// Connects to MongoDB using the URI from environment variables.
// Called once when the server starts (see server.js).
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Exit the process — the API is useless without a DB connection.
    process.exit(1);
  }
};

export default connectDB;
