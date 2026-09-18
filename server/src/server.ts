import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeders/seed.js';

import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import studyLogRoutes from './routes/studyLogRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import mockTestRoutes from './routes/mockTestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/study-logs', studyLogRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Competitive Exam Tracker API',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Competitive Exam Tracker Server running at http://localhost:${PORT}`);
    console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
