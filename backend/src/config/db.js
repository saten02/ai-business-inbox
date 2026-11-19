const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Reject query filters that contain operator injection keys (e.g. $gt)
    mongoose.set("sanitizeFilter", true);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;