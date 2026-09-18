import { Response } from 'express';
import { MockTest } from '../models/MockTest.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMockTests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.query;
    const filter: any = { userId: req.userId };
    if (examId) filter.examId = examId;

    const tests = await MockTest.find(filter).sort({ date: -1 });
    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch mock tests', error: error.message });
  }
};

export const createMockTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      examId,
      examName,
      testName,
      testSeries,
      date,
      totalMarks,
      scoredMarks,
      accuracyPercentage,
      percentile,
      subjectScores,
      strongTopics,
      weakTopics,
      analysisNotes,
    } = req.body;

    if (!testName || totalMarks === undefined || scoredMarks === undefined) {
      res.status(400).json({ message: 'Test name, total marks, and scored marks are required.' });
      return;
    }

    const test = await MockTest.create({
      userId: req.userId,
      examId,
      examName: examName || 'General Mock Test',
      testName,
      testSeries: testSeries || 'Self Practice',
      date: date ? new Date(date) : new Date(),
      totalMarks: Number(totalMarks),
      scoredMarks: Number(scoredMarks),
      accuracyPercentage: Number(accuracyPercentage) || Math.round((Number(scoredMarks) / Number(totalMarks)) * 100),
      percentile: percentile ? Number(percentile) : undefined,
      subjectScores: subjectScores || [],
      strongTopics: Array.isArray(strongTopics) ? strongTopics : [],
      weakTopics: Array.isArray(weakTopics) ? weakTopics : [],
      analysisNotes: analysisNotes || '',
    });

    res.status(201).json(test);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to log mock test', error: error.message });
  }
};

export const getMockTestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await MockTest.findOne({ _id: req.params.id, userId: req.userId });
    if (!test) {
      res.status(404).json({ message: 'Mock test not found' });
      return;
    }
    res.json(test);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch mock test', error: error.message });
  }
};

export const deleteMockTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await MockTest.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!test) {
      res.status(404).json({ message: 'Mock test not found' });
      return;
    }
    res.json({ message: 'Mock test record deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete mock test', error: error.message });
  }
};

export const getMockAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.query;
    const filter: any = { userId: req.userId };
    if (examId) filter.examId = examId;

    const tests = await MockTest.find(filter).sort({ date: 1 });

    const totalTests = tests.length;
    if (totalTests === 0) {
      res.json({
        totalTests: 0,
        averageScorePercentage: 0,
        averageAccuracy: 0,
        averagePercentile: 0,
        trend: [],
        subjectPerformance: [],
        frequentWeakTopics: [],
      });
      return;
    }

    let totalScorePct = 0;
    let totalAccuracy = 0;
    let totalPercentile = 0;
    let percentileCount = 0;

    const subjectMap: { [key: string]: { total: number; scored: number } } = {};
    const weakTopicsMap: { [key: string]: number } = {};

    const trend = tests.map((t) => {
      const scorePct = Math.round((t.scoredMarks / t.totalMarks) * 100);
      totalScorePct += scorePct;
      totalAccuracy += t.accuracyPercentage;
      if (t.percentile !== undefined && t.percentile !== null) {
        totalPercentile += t.percentile;
        percentileCount += 1;
      }

      t.subjectScores?.forEach((s) => {
        if (!subjectMap[s.subject]) {
          subjectMap[s.subject] = { total: 0, scored: 0 };
        }
        subjectMap[s.subject].total += s.totalMarks;
        subjectMap[s.subject].scored += s.scoredMarks;
      });

      t.weakTopics?.forEach((wt) => {
        const trimmed = wt.trim();
        if (trimmed) {
          weakTopicsMap[trimmed] = (weakTopicsMap[trimmed] || 0) + 1;
        }
      });

      return {
        id: t._id,
        testName: t.testName,
        examName: t.examName,
        date: t.date.toISOString().split('T')[0],
        scoredMarks: t.scoredMarks,
        totalMarks: t.totalMarks,
        scorePercentage: scorePct,
        accuracyPercentage: t.accuracyPercentage,
        percentile: t.percentile || null,
      };
    });

    const subjectPerformance = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      totalMarks: data.total,
      scoredMarks: data.scored,
      percentage: data.total > 0 ? Math.round((data.scored / data.total) * 100) : 0,
    }));

    const frequentWeakTopics = Object.entries(weakTopicsMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      totalTests,
      averageScorePercentage: Math.round(totalScorePct / totalTests),
      averageAccuracy: Math.round(totalAccuracy / totalTests),
      averagePercentile: percentileCount > 0 ? Number((totalPercentile / percentileCount).toFixed(1)) : null,
      trend,
      subjectPerformance,
      frequentWeakTopics,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate mock analytics', error: error.message });
  }
};
