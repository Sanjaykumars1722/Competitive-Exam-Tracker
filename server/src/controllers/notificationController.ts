import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { Exam } from '../models/Exam.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { $set: { isRead: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to mark notifications read', error: error.message });
  }
};

export const clearNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.deleteMany({ userId: req.userId });
    res.json({ message: 'Notifications cleared' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to clear notifications', error: error.message });
  }
};

export const triggerSmartReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const exams = await Exam.find({ userId: req.userId, isArchived: false });

    let createdCount = 0;

    for (const exam of exams) {
      const diffMs = new Date(exam.targetDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 30) {
        const title = `⚠️ ${diffDays} Days Left for ${exam.name}`;
        const existing = await Notification.findOne({
          userId: req.userId,
          title,
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        });

        if (!existing) {
          await Notification.create({
            userId: req.userId,
            title,
            message: `Only ${diffDays} days remain before the ${exam.name} examination date. Review your revision schedule and mock test strategy.`,
            type: 'DEADLINE',
            link: `/exams`,
          });
          createdCount += 1;
        }
      }
    }

    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.json({ createdCount, notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to run reminders', error: error.message });
  }
};
