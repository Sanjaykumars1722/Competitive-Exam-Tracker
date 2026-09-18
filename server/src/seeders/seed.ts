import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Exam } from '../models/Exam.js';
import { StudyLog } from '../models/StudyLog.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { MockTest } from '../models/MockTest.js';
import { Notification } from '../models/Notification.js';
import { EXAM_PRESETS } from './examPresets.js';

export const seedDatabase = async () => {
  try {
    const existingDemo = await User.findOne({ email: 'demo@examtracker.dev' });
    if (existingDemo) {
      console.log('ℹ️ Demo account already exists. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding initial demo data...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      name: 'Aarav Sharma',
      email: 'demo@examtracker.dev',
      password: hashedPassword,
      targetExams: ['UPSC Civil Services', 'GATE Computer Science'],
      dailyStudyGoalHours: 5,
      streakCount: 12,
      lastActiveDate: new Date(),
    });

    const createdExams = [];
    const now = new Date();

    for (const preset of EXAM_PRESETS.slice(0, 3)) {
      const targetDate = new Date();
      targetDate.setMonth(now.getMonth() + preset.targetMonthsAhead);

      const regDeadline = new Date();
      regDeadline.setMonth(now.getMonth() + Math.max(1, preset.targetMonthsAhead - 2));

      const exam = await Exam.create({
        userId: demoUser._id,
        name: preset.name,
        category: preset.category,
        code: preset.code,
        targetDate,
        registrationDeadline: regDeadline,
        stages: preset.stages,
        officialWebsite: preset.officialWebsite,
        syllabus: preset.syllabus,
        notes: `Targeting top 50 rank in ${preset.name}. Follow regular spaced repetition.`,
      });
      createdExams.push(exam);
    }

    const upscExam = createdExams[0];
    const gateExam = createdExams[2] || createdExams[0];

    // Seed Study Logs (Past 10 days for rich charts)
    const sampleLogs = [
      { daysAgo: 0, hours: 4.5, subject: 'Polity & Constitution', topic: 'Parliamentary Committees', sessionType: 'POMODORO' },
      { daysAgo: 1, hours: 5.2, subject: 'Modern Indian History', topic: 'Gandhian Mass Movements', sessionType: 'READING' },
      { daysAgo: 2, hours: 3.8, subject: 'Data Structures & Algorithms', topic: 'Graph Traversal (Dijkstra)', sessionType: 'PROBLEM_SOLVING' },
      { daysAgo: 3, hours: 6.0, subject: 'Operating Systems', topic: 'Memory Virtualization & Paging', sessionType: 'REVISION' },
      { daysAgo: 4, hours: 4.0, subject: 'Indian Economy', topic: 'Monetary Policy & Inflation', sessionType: 'POMODORO' },
      { daysAgo: 5, hours: 5.5, subject: 'CSAT Reasoning', topic: 'Syllogisms & Data Sufficiency', sessionType: 'PROBLEM_SOLVING' },
      { daysAgo: 6, hours: 4.5, subject: 'Database Systems', topic: 'Relational Algebra & SQL', sessionType: 'MOCK_TEST' },
      { daysAgo: 7, hours: 3.5, subject: 'Geography', topic: 'Plate Tectonics & Earthquakes', sessionType: 'REVISION' },
    ];

    for (const item of sampleLogs) {
      const logDate = new Date();
      logDate.setDate(now.getDate() - item.daysAgo);
      await StudyLog.create({
        userId: demoUser._id,
        examId: upscExam._id,
        examName: upscExam.name,
        subject: item.subject,
        topic: item.topic,
        durationMinutes: Math.round(item.hours * 60),
        sessionType: item.sessionType as any,
        notes: `Completed targeted focus blocks for ${item.topic}.`,
        date: logDate,
      });
    }

    // Seed Mock Tests
    await MockTest.create([
      {
        userId: demoUser._id,
        examId: upscExam._id,
        examName: upscExam.name,
        testName: 'All-India Prelims Full Mock 01',
        testSeries: 'VisionIAS Abhyaas',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalMarks: 200,
        scoredMarks: 114.5,
        accuracyPercentage: 74,
        percentile: 91.2,
        subjectScores: [
          { subject: 'Polity & Constitution', totalMarks: 50, scoredMarks: 38 },
          { subject: 'History & Culture', totalMarks: 40, scoredMarks: 22 },
          { subject: 'Economy', totalMarks: 50, scoredMarks: 31 },
          { subject: 'Environment & SciTech', totalMarks: 60, scoredMarks: 23.5 },
        ],
        strongTopics: ['Preamble & Fundamental Rights', 'Banking & Repo Rates'],
        weakTopics: ['Modern Indian Art & Architecture', 'Wildlife Sanctuaries'],
        analysisNotes: 'Good accuracy in Polity. Need to brush up art and culture timeline and national parks.',
      },
      {
        userId: demoUser._id,
        examId: upscExam._id,
        examName: upscExam.name,
        testName: 'Sectional Test - Indian Polity',
        testSeries: 'ForumIAS SFG',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        scoredMarks: 72,
        accuracyPercentage: 82,
        percentile: 94.6,
        subjectScores: [
          { subject: 'Constitutional Bodies', totalMarks: 40, scoredMarks: 32 },
          { subject: 'Judiciary', totalMarks: 30, scoredMarks: 22 },
          { subject: 'Emergency Provisions', totalMarks: 30, scoredMarks: 18 },
        ],
        strongTopics: ['Election Commission', 'High Court Writs'],
        weakTopics: ['Financial Emergency articles'],
        analysisNotes: 'Fast solving speed, 42 minutes taken out of 60.',
      },
      {
        userId: demoUser._id,
        examId: gateExam._id,
        examName: gateExam.name,
        testName: 'GATE CS Subject Mock: Data Structures',
        testSeries: 'Made Easy CBT',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        totalMarks: 50,
        scoredMarks: 41,
        accuracyPercentage: 88,
        percentile: 96.8,
        subjectScores: [
          { subject: 'Binary Search Trees & AVL', totalMarks: 25, scoredMarks: 23 },
          { subject: 'Graph Algorithms', totalMarks: 25, scoredMarks: 18 },
        ],
        strongTopics: ['Tree Traversals', 'Min Heap Operations'],
        weakTopics: ['Bellman-Ford negative cycle edge cases'],
        analysisNotes: 'Excellent time management; slight calculation mistake on vertex count in sparse graph.',
      },
    ]);

    // Seed Study Materials
    await StudyMaterial.create([
      {
        userId: demoUser._id,
        examId: upscExam._id,
        examName: upscExam.name,
        title: 'UPSC CSE Prelims 10-Year Topic-wise Solved PYQs (2014-2024)',
        subject: 'General Studies I',
        category: 'PYQ',
        url: 'https://archive.org/details/upsc-pyq-compilation',
        tags: ['PYQ', 'High Yield', 'Must-Solve', 'UPSC'],
        isFavorite: true,
        notes: 'Review questions after completing each chapter in standard reference books.',
      },
      {
        userId: demoUser._id,
        examId: upscExam._id,
        examName: upscExam.name,
        title: 'Indian Polity 7th Edition Mindmaps & Summary Sheets',
        subject: 'Polity & Constitution',
        category: 'NOTES',
        url: 'https://drive.google.com/open?id=demo-polity-mindmaps',
        tags: ['Laxmikanth', 'Quick Revision', 'Mindmaps'],
        isFavorite: true,
        notes: 'Handwritten tables of all Constitutional articles and amendments.',
      },
      {
        userId: demoUser._id,
        examId: gateExam._id,
        examName: gateExam.name,
        title: 'GATE CS Algorithms & Asymptotic Complexity Cheat Sheet',
        subject: 'Data Structures & Algorithms',
        category: 'FORMULA_SHEET',
        url: 'https://gateoverflow.in/resources',
        tags: ['Formulas', 'Recurrence', 'Master Theorem'],
        isFavorite: false,
        notes: 'Summary of time and space complexities for all standard sorting & search routines.',
      },
      {
        userId: demoUser._id,
        examId: upscExam._id,
        examName: upscExam.name,
        title: 'Complete Indian Monsoon Mechanism & Climatology Video Lectures',
        subject: 'Physical Geography',
        category: 'VIDEO',
        url: 'https://youtube.com/playlist?list=demo-geography-monsoon',
        tags: ['YouTube', 'Visual Concept', 'Monsoon'],
        isFavorite: false,
        notes: 'Best 4-part lecture series on Jet Streams, Somali Jet and Indian Ocean Dipole.',
      },
    ]);

    // Seed Notifications
    await Notification.create([
      {
        userId: demoUser._id,
        title: 'Upcoming Exam Milestone',
        message: `${upscExam.name} Prelims is in approximately 120 days. Keep up your daily 5-hour study target!`,
        type: 'DEADLINE',
        isRead: false,
        link: '/exams',
      },
      {
        userId: demoUser._id,
        title: 'Spaced Repetition Due: Modern Indian History',
        message: 'It has been 7 days since you reviewed Gandhian Era & Mass Movements. Time for a quick 20-min revision!',
        type: 'REVISION',
        isRead: false,
        link: '/syllabus',
      },
      {
        userId: demoUser._id,
        title: '12-Day Study Streak Maintained! 🔥',
        message: 'Consistency is king! You have hit your study goal for 12 consecutive days.',
        type: 'STREAK',
        isRead: true,
        link: '/planner',
      },
    ]);

    console.log('✅ Demo database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
