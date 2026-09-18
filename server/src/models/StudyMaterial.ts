import mongoose, { Document, Schema, Types } from 'mongoose';

export type MaterialCategory = 'PYQ' | 'NOTES' | 'EBOOK' | 'VIDEO' | 'FORMULA_SHEET' | 'MOCK_PAPER';

export interface IStudyMaterial extends Document {
  userId: Types.ObjectId;
  examId?: Types.ObjectId;
  examName: string;
  title: string;
  subject: string;
  category: MaterialCategory;
  url: string;
  tags: string[];
  isFavorite: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    examName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['PYQ', 'NOTES', 'EBOOK', 'VIDEO', 'FORMULA_SHEET', 'MOCK_PAPER'],
      default: 'NOTES',
    },
    url: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const StudyMaterial = mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);
