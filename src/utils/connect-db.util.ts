import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB is connected!");
  } catch (err) {
    console.log("MONGODB CONNECTION ERROR", err);
  }
};

export default connectDB;
