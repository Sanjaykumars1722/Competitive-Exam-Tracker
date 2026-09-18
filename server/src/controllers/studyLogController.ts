import { Response } from 'express';
import { StudyLog } from '../models/StudyLog.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export const getStudyLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, limit = 50, page = 1 } = req.query;
    const filter: any = { userId: req.userId };

    if (examId) {
      filter.examId = examId;
    }

    const logs = await StudyLog.find(filter)
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await StudyLog.countDocuments(filter);

    res.json({ logs, total });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch study logs', error: error.message });
  }
};

export const createStudyLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, examName, subject, topic, durationMinutes, sessionType, notes, date } = req.body;

    if (!subject || !durationMinutes) {
      res.status(400).json({ message: 'Subject and duration in minutes are required.' });
      return;
    }

    const log = await StudyLog.create({
      userId: req.userId,
      examId,
      examName: examName || 'General Prep',
      subject,
      topic: topic || '',
      durationMinutes: Number(durationMinutes),
      sessionType: sessionType || 'POMODORO',
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
    });

    // Check user's total study time for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const user = await User.findById(req.userId);
    if (user) {
      const todayLogs = await StudyLog.find({
        userId: user._id,
        date: { $gte: startOfToday },
      });

      const todayMinutes = todayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const goalMinutes = (user.dailyStudyGoalHours || 4) * 60;

      if (todayMinutes >= goalMinutes) {
        const existingNotification = await Notification.findOne({
          userId: user._id,
          type: 'ACHIEVEMENT',
          createdAt: { $gte: startOfToday },
        });

        if (!existingNotification) {
          await Notification.create({
            userId: user._id,
            title: '🎯 Daily Goal Smashed!',
            message: `Congratulations! You have reached your ${user.dailyStudyGoalHours}-hour daily study target today.`,
            type: 'ACHIEVEMENT',
            link: '/planner',
          });
        }
      }
    }

    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to log study session', error: error.message });
  }
};

export const deleteStudyLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const log = await StudyLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) {
      res.status(404).json({ message: 'Study log not found' });
      return;
    }
    res.json({ message: 'Study log removed' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete study log', error: error.message });
  }
};

export const getStudyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    const dailyGoalHours = user?.dailyStudyGoalHours || 4;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const past7DaysDate = new Date();
    past7DaysDate.setDate(past7DaysDate.getDate() - 6);
    past7DaysDate.setHours(0, 0, 0, 0);

    const allLogs = await StudyLog.find({ userId: req.userId });

    const totalLifetimeMinutes = allLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const todayLogs = allLogs.filter((l) => new Date(l.date) >= startOfToday);
    const todayMinutes = todayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const dayMap: { [key: string]: number } = {};
    const daysArr = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap[dateKey] = 0;
      daysArr.push({ dateKey, dayLabel, hours: 0 });
    }

    allLogs.forEach((l) => {
      const dateKey = new Date(l.date).toISOString().split('T')[0];
      if (dayMap[dateKey] !== undefined) {
        dayMap[dateKey] += l.durationMinutes;
      }
    });

    const weeklyChart = daysArr.map((item) => ({
      day: item.dayLabel,
      date: item.dateKey,
      hours: Number((dayMap[item.dateKey] / 60).toFixed(1)),
      targetHours: dailyGoalHours,
    }));

    const subjectMap: { [key: string]: number } = {};
    allLogs.forEach((l) => {
      subjectMap[l.subject] = (subjectMap[l.subject] || 0) + l.durationMinutes;
    });

    const subjectBreakdown = Object.entries(subjectMap)
      .map(([subject, minutes]) => ({
        subject,
        hours: Number((minutes / 60).toFixed(1)),
        minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    res.json({
      todayHours: Number((todayMinutes / 60).toFixed(1)),
      todayMinutes,
      dailyGoalHours,
      goalProgressPercentage: Math.min(100, Math.round((todayMinutes / (dailyGoalHours * 60)) * 100)),
      totalLifetimeHours: Number((totalLifetimeMinutes / 60).toFixed(1)),
      streakCount: user?.streakCount || 0,
      weeklyChart,
      subjectBreakdown,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to compute study stats', error: error.message });
  }
};
