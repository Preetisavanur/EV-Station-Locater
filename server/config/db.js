const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://EV:lWjf6wci08IKxsMV@cluster0.7z0bvyk.mongodb.net/?appName=Cluster0");
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;