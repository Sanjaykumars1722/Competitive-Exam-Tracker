import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudyLog extends Document {
  userId: Types.ObjectId;
  examId?: Types.ObjectId;
  examName: string;
  subject: string;
  topic?: string;
  durationMinutes: number;
  sessionType: 'POMODORO' | 'REVISION' | 'PROBLEM_SOLVING' | 'READING' | 'MOCK_TEST';
  notes?: string;
  date: Date;
  createdAt: Date;
}

const StudyLogSchema = new Schema<IStudyLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    examName: { type: String, default: 'General Prep' },
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    durationMinutes: { type: Number, required: true, min: 1 },
    sessionType: {
      type: String,
      enum: ['POMODORO', 'REVISION', 'PROBLEM_SOLVING', 'READING', 'MOCK_TEST'],
      default: 'POMODORO',
    },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const StudyLog = mongoose.model<IStudyLog>('StudyLog', StudyLogSchema);
