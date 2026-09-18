import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exam_tracker';

  try {
    // First try connecting to the configured URI with a 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Connected to MongoDB at: ${uri}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB at ${uri}.`);
    console.log(`🚀 Starting in-memory MongoDB server (mongodb-memory-server) for zero-setup execution...`);

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to In-Memory MongoDB at: ${memoryUri}`);
    } catch (memError) {
      console.error('❌ Failed to start in-memory MongoDB:', memError);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
