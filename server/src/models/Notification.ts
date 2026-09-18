import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType = 'DEADLINE' | 'REVISION' | 'STREAK' | 'INFO' | 'ACHIEVEMENT';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['DEADLINE', 'REVISION', 'STREAK', 'INFO', 'ACHIEVEMENT'],
      default: 'INFO',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
