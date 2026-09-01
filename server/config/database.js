import mongoose from "mongoose";

// Connect only when a MongoDB URI is configured. This keeps local UI demos easy to run.
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI is not set; using temporary in-memory parking data.",
    );
    return false;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  return true;
}
