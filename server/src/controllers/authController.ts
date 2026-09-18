import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Exam } from '../models/Exam.js';
import { EXAM_PRESETS } from '../seeders/examPresets.js';
import { AuthRequest } from '../middleware/auth.js';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_exam_tracker_jwt_key_2025_secure';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, targetExams, dailyStudyGoalHours, autoSeedPresets } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      targetExams: targetExams || [],
      dailyStudyGoalHours: Number(dailyStudyGoalHours) || 4,
      streakCount: 1,
      lastActiveDate: new Date(),
    });

    if (autoSeedPresets !== false) {
      const presetsToClone = EXAM_PRESETS.slice(0, 2);
      const now = new Date();
      for (const preset of presetsToClone) {
        const targetDate = new Date();
        targetDate.setMonth(now.getMonth() + preset.targetMonthsAhead);

        await Exam.create({
          userId: user._id,
          name: preset.name,
          category: preset.category,
          code: preset.code,
          targetDate,
          stages: preset.stages,
          officialWebsite: preset.officialWebsite,
          syllabus: preset.syllabus,
          notes: `Prep plan for ${preset.name}`,
        });
      }
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetExams: user.targetExams,
        dailyStudyGoalHours: user.dailyStudyGoalHours,
        streakCount: user.streakCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const now = new Date();
    if (user.lastActiveDate) {
      const diffTime = Math.abs(now.getTime() - new Date(user.lastActiveDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streakCount += 1;
      } else if (diffDays > 2) {
        user.streakCount = 1;
      }
    }
    user.lastActiveDate = now;
    await user.save();

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetExams: user.targetExams,
        dailyStudyGoalHours: user.dailyStudyGoalHours,
        streakCount: user.streakCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const demoLogin = async (_req: Request, res: Response): Promise<void> => {
  try {
    let demoUser = await User.findOne({ email: 'demo@examtracker.dev' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      demoUser = await User.create({
        name: 'Aarav Sharma',
        email: 'demo@examtracker.dev',
        password: hashedPassword,
        targetExams: ['UPSC Civil Services', 'GATE Computer Science'],
        dailyStudyGoalHours: 5,
        streakCount: 12,
        lastActiveDate: new Date(),
      });
    }

    const token = generateToken(demoUser._id.toString());

    res.json({
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        targetExams: demoUser.targetExams,
        dailyStudyGoalHours: demoUser.dailyStudyGoalHours,
        streakCount: demoUser.streakCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Demo login failed', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, targetExams, dailyStudyGoalHours } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (targetExams) user.targetExams = targetExams;
    if (dailyStudyGoalHours) user.dailyStudyGoalHours = Number(dailyStudyGoalHours);

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      targetExams: user.targetExams,
      dailyStudyGoalHours: user.dailyStudyGoalHours,
      streakCount: user.streakCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};
