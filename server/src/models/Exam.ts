import mongoose, { Document, Schema, Types } from 'mongoose';

export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'REVISED_1X' | 'REVISED_2X' | 'REVISED_3X' | 'MASTERED';

export interface ITopic {
  id: string;
  name: string;
  status: TopicStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  lastRevised: Date | null;
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

export interface IExam extends Document {
  userId: Types.ObjectId;
  name: string;
  category: string;
  code: string;
  targetDate: Date;
  registrationDeadline?: Date;
  stages: IStage[];
  officialWebsite?: string;
  syllabus: ISubject[];
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'REVISED_1X', 'REVISED_2X', 'REVISED_3X', 'MASTERED'],
      default: 'NOT_STARTED',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    lastRevised: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const ChapterSchema = new Schema<IChapter>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    topics: [TopicSchema],
  },
  { _id: false }
);

const SubjectSchema = new Schema<ISubject>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    chapters: [ChapterSchema],
  },
  { _id: false }
);

const StageSchema = new Schema<IStage>(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'CLEARED', 'NOT_CLEARED'],
      default: 'UPCOMING',
    },
  },
  { _id: false }
);

const ExamSchema = new Schema<IExam>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Civil Services', 'Engineering', 'Management', 'Medical', 'Banking/Govt', 'International', 'Other'],
      default: 'Other',
    },
    code: { type: String, required: true, uppercase: true, trim: true },
    targetDate: { type: Date, required: true },
    registrationDeadline: { type: Date },
    stages: [StageSchema],
    officialWebsite: { type: String },
    syllabus: [SubjectSchema],
    notes: { type: String, default: '' },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
