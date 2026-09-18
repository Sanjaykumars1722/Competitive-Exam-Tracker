import { Response } from 'express';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, subject, category, search, favoriteOnly } = req.query;
    const filter: any = { userId: req.userId };

    if (examId) filter.examId = examId;
    if (subject) filter.subject = subject;
    if (category) filter.category = category;
    if (favoriteOnly === 'true') filter.isFavorite = true;

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [{ title: searchRegex }, { tags: searchRegex }, { subject: searchRegex }, { notes: searchRegex }];
    }

    const materials = await StudyMaterial.find(filter).sort({ isFavorite: -1, createdAt: -1 });
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch materials', error: error.message });
  }
};

export const createMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, examName, title, subject, category, url, tags, isFavorite, notes } = req.body;

    if (!title || !subject || !url) {
      res.status(400).json({ message: 'Title, subject, and resource URL/link are required.' });
      return;
    }

    const material = await StudyMaterial.create({
      userId: req.userId,
      examId,
      examName: examName || 'General Prep',
      title,
      subject,
      category: category || 'NOTES',
      url,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      isFavorite: Boolean(isFavorite),
      notes: notes || '',
    });

    res.status(201).json(material);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create study material', error: error.message });
  }
};

export const updateMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!material) {
      res.status(404).json({ message: 'Study material not found' });
      return;
    }

    res.json(material);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update study material', error: error.message });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const material = await StudyMaterial.findOne({ _id: req.params.id, userId: req.userId });
    if (!material) {
      res.status(404).json({ message: 'Study material not found' });
      return;
    }

    material.isFavorite = !material.isFavorite;
    await material.save();

    res.json(material);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle favorite', error: error.message });
  }
};

export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const material = await StudyMaterial.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!material) {
      res.status(404).json({ message: 'Study material not found' });
      return;
    }
    res.json({ message: 'Study material deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete study material', error: error.message });
  }
};
