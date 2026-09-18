export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'REVISED_1X' | 'REVISED_2X' | 'REVISED_3X' | 'MASTERED';

export interface ITopic {
  id: string;
  name: string;
  status: TopicStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  lastRevised: string | null;
  notes?: string;
}

export interface IChapter {
  id: string;
  name: string;
  topics: ITopic[];
}

export interface ISubject {
  id: string;
  name: string;
  chapters: IChapter[];
}

export interface IStage {
  name: string;
  status: 'UPCOMING' | 'ONGOING' | 'CLEARED' | 'NOT_CLEARED';
}

export interface ISyllabusMetrics {
  totalTopics: number;
  masteredTopics: number;
  revisedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  completionPercentage: number;
}

export interface IExam {
  _id: string;
  name: string;
  category: string;
  code: string;
  targetDate: string;
  registrationDeadline?: string;
  stages: IStage[];
  officialWebsite?: string;
  syllabus: ISubject[];
  notes?: string;
  metrics?: ISyllabusMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface IStudyLog {
  _id: string;
  examId?: string;
  examName: string;
  subject: string;
  topic?: string;
  durationMinutes: number;
  sessionType: 'POMODORO' | 'REVISION' | 'PROBLEM_SOLVING' | 'READING' | 'MOCK_TEST';
  notes?: string;
  date: string;
}

export interface IStudyStats {
  todayHours: number;
  todayMinutes: number;
  dailyGoalHours: number;
  goalProgressPercentage: number;
  totalLifetimeHours: number;
  streakCount: number;
  weeklyChart: {
    day: string;
    date: string;
    hours: number;
    targetHours: number;
  }[];
  subjectBreakdown: {
    subject: string;
    hours: number;
    minutes: number;
  }[];
}

export type MaterialCategory = 'PYQ' | 'NOTES' | 'EBOOK' | 'VIDEO' | 'FORMULA_SHEET' | 'MOCK_PAPER';

export interface IStudyMaterial {
  _id: string;
  examId?: string;
  examName: string;
  title: string;
  subject: string;
  category: MaterialCategory;
  url: string;
  tags: string[];
  isFavorite: boolean;
  notes?: string;
  createdAt: string;
}

export interface ISubjectScore {
  subject: string;
  totalMarks: number;
  scoredMarks: number;
}

export interface IMockTest {
  _id: string;
  examId?: string;
  examName: string;
  testName: string;
  testSeries: string;
  date: string;
  totalMarks: number;
  scoredMarks: number;
  accuracyPercentage: number;
  percentile?: number;
  subjectScores: ISubjectScore[];
  strongTopics: string[];
  weakTopics: string[];
  analysisNotes?: string;
}

export interface IMockAnalytics {
  totalTests: number;
  averageScorePercentage: number;
  averageAccuracy: number;
  averagePercentile: number | null;
  trend: {
    id: string;
    testName: string;
    examName: string;
    date: string;
    scoredMarks: number;
    totalMarks: number;
    scorePercentage: number;
    accuracyPercentage: number;
    percentile: number | null;
  }[];
  subjectPerformance: {
    subject: string;
    totalMarks: number;
    scoredMarks: number;
    percentage: number;
  }[];
  frequentWeakTopics: {
    topic: string;
    count: number;
  }[];
}

export type NotificationType = 'DEADLINE' | 'REVISION' | 'STREAK' | 'INFO' | 'ACHIEVEMENT';

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  targetExams: string[];
  dailyStudyGoalHours: number;
  streakCount: number;
}
