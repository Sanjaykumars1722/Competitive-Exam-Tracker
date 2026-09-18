import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubjectScore {
  subject: string;
  totalMarks: number;
  scoredMarks: number;
}

export interface IMockTest extends Document {
  userId: Types.ObjectId;
  examId?: Types.ObjectId;
  examName: string;
  testName: string;
  testSeries: string;
  date: Date;
  totalMarks: number;
  scoredMarks: number;
  accuracyPercentage: number;
  percentile?: number;
  subjectScores: ISubjectScore[];
  strongTopics: string[];
  weakTopics: string[];
  analysisNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectScoreSchema = new Schema<ISubjectScore>(
  {
    subject: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    scoredMarks: { type: Number, required: true },
  },
  { _id: false }
);

const MockTestSchema = new Schema<IMockTest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    examName: { type: String, required: true },
    testName: { type: String, required: true, trim: true },
    testSeries: { type: String, default: 'Self / Online' },
    date: { type: Date, default: Date.now },
    totalMarks: { type: Number, required: true },
    scoredMarks: { type: Number, required: true },
    accuracyPercentage: { type: Number, required: true, min: 0, max: 100 },
    percentile: { type: Number, min: 0, max: 100 },
    subjectScores: [SubjectScoreSchema],
    strongTopics: { type: [String], default: [] },
    weakTopics: { type: [String], default: [] },
    analysisNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const MockTest = mongoose.model<IMockTest>('MockTest', MockTestSchema);
