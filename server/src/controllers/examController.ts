import { Response } from 'express';
import { Exam, IExam, TopicStatus } from '../models/Exam.js';
import { EXAM_PRESETS } from '../seeders/examPresets.js';
import { AuthRequest } from '../middleware/auth.js';

export const calculateSyllabusMetrics = (syllabus: any[]) => {
  let totalTopics = 0;
  let masteredTopics = 0;
  let revisedTopics = 0;
  let inProgressTopics = 0;
  let notStartedTopics = 0;

  if (!syllabus || !Array.isArray(syllabus)) {
    return {
      totalTopics: 0,
      masteredTopics: 0,
      revisedTopics: 0,
      inProgressTopics: 0,
      notStartedTopics: 0,
      completionPercentage: 0,
    };
  }

  syllabus.forEach((subject) => {
    subject.chapters?.forEach((chapter: any) => {
      chapter.topics?.forEach((topic: any) => {
        totalTopics += 1;
        if (topic.status === 'MASTERED') {
          masteredTopics += 1;
        } else if (topic.status && topic.status.startsWith('REVISED')) {
          revisedTopics += 1;
        } else if (topic.status === 'IN_PROGRESS') {
          inProgressTopics += 1;
        } else {
          notStartedTopics += 1;
        }
      });
    });
  });

  const weightedScore =
    masteredTopics * 1.0 + revisedTopics * 0.75 + inProgressTopics * 0.35;
  const completionPercentage =
    totalTopics > 0 ? Math.round((weightedScore / totalTopics) * 100) : 0;

  return {
    totalTopics,
    masteredTopics,
    revisedTopics,
    inProgressTopics,
    notStartedTopics,
    completionPercentage,
  };
};

export const getExams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exams = await Exam.find({ userId: req.userId, isArchived: false }).sort({ targetDate: 1 });

    const enrichedExams = exams.map((exam) => {
      const metrics = calculateSyllabusMetrics(exam.syllabus);
      return {
        ...exam.toObject(),
        metrics,
      };
    });

    res.json(enrichedExams);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
};

export const getExamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, userId: req.userId });
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }

    const metrics = calculateSyllabusMetrics(exam.syllabus);
    res.json({
      ...exam.toObject(),
      metrics,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch exam', error: error.message });
  }
};

export const createExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, code, targetDate, registrationDeadline, stages, officialWebsite, syllabus, notes } = req.body;

    if (!name || !code || !targetDate) {
      res.status(400).json({ message: 'Name, exam code, and target date are required.' });
      return;
    }

    const exam = await Exam.create({
      userId: req.userId,
      name,
      category: category || 'Other',
      code: code.toUpperCase(),
      targetDate: new Date(targetDate),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      stages: stages || [{ name: 'Single Stage', status: 'UPCOMING' }],
      officialWebsite,
      syllabus: syllabus || [],
      notes,
    });

    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create exam', error: error.message });
  }
};

export const updateExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }

    res.json(exam);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update exam', error: error.message });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }
    res.json({ message: 'Exam deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete exam', error: error.message });
  }
};

export const updateTopicStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, topicId } = req.params;
    const { status, notes, priority } = req.body;

    const exam = await Exam.findOne({ _id: examId, userId: req.userId });
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }

    let foundTopic = false;

    exam.syllabus.forEach((subject) => {
      subject.chapters.forEach((chapter) => {
        const topic = chapter.topics.find((t) => t.id === topicId);
        if (topic) {
          foundTopic = true;
          if (status) {
            topic.status = status as TopicStatus;
            if (status.startsWith('REVISED') || status === 'MASTERED') {
              topic.lastRevised = new Date();
            }
          }
          if (notes !== undefined) topic.notes = notes;
          if (priority) topic.priority = priority;
        }
      });
    });

    if (!foundTopic) {
      res.status(404).json({ message: 'Topic not found in this exam syllabus.' });
      return;
    }

    exam.markModified('syllabus');
    await exam.save();

    const metrics = calculateSyllabusMetrics(exam.syllabus);
    res.json({ message: 'Topic updated successfully', metrics, exam });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update topic status', error: error.message });
  }
};

export const addSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Subject name is required.' });
      return;
    }

    const exam = await Exam.findOne({ _id: examId, userId: req.userId });
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }

    const newSubject = {
      id: `subj-${Date.now()}`,
      name,
      chapters: [],
    };

    exam.syllabus.push(newSubject);
    await exam.save();

    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add subject', error: error.message });
  }
};

export const addChapter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, subjectId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Chapter name is required.' });
      return;
    }

    const exam = await Exam.findOne({ _id: examId, userId: req.userId });
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }

    const subject = exam.syllabus.find((s) => s.id === subjectId);
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    const newChapter = {
      id: `chap-${Date.now()}`,
      name,
      topics: [],
    };

    subject.chapters.push(newChapter);
    exam.markModified('syllabus');
    await exam.save();

    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add chapter', error: error.message });
  }
};

export const addTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, chapterId } = req.params;
    const { name, priority, notes } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Topic name is required.' });
      return;
    }

    const exam = await Exam.findOne({ _id: examId, userId: req.userId });
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }

    let targetChapter: any = null;
    exam.syllabus.forEach((s) => {
      const found = s.chapters.find((c) => c.id === chapterId);
      if (found) targetChapter = found;
    });

    if (!targetChapter) {
      res.status(404).json({ message: 'Chapter not found' });
      return;
    }

    const newTopic = {
      id: `topic-${Date.now()}`,
      name,
      status: 'NOT_STARTED' as TopicStatus,
      priority: priority || 'MEDIUM',
      lastRevised: null,
      notes: notes || '',
    };

    targetChapter.topics.push(newTopic);
    exam.markModified('syllabus');
    await exam.save();

    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add topic', error: error.message });
  }
};

export const getPresets = (_req: AuthRequest, res: Response): void => {
  res.json(EXAM_PRESETS);
};

export const importPreset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { presetCode, targetDate } = req.body;
    const preset = EXAM_PRESETS.find((p) => p.code === presetCode);

    if (!preset) {
      res.status(404).json({ message: 'Exam preset not found' });
      return;
    }

    const now = new Date();
    const finalTargetDate = targetDate
      ? new Date(targetDate)
      : new Date(now.setMonth(now.getMonth() + preset.targetMonthsAhead));

    const exam = await Exam.create({
      userId: req.userId,
      name: preset.name,
      category: preset.category,
      code: preset.code,
      targetDate: finalTargetDate,
      stages: preset.stages,
      officialWebsite: preset.officialWebsite,
      syllabus: preset.syllabus,
      notes: `Imported preset for ${preset.name}`,
    });

    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to import preset', error: error.message });
  }
};
