import mongoose from 'mongoose';

export interface IJob extends mongoose.Document {
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  type: 'fulltime' | 'parttime' | 'internship' | 'contract';
  postedBy: mongoose.Types.ObjectId;
  postedDate: Date;
  deadline?: Date;
  source: 'linkedin' | 'indeed' | 'manual';
  url?: string;
  active: boolean;
  applicants: mongoose.Types.ObjectId[];
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  remote: { type: Boolean, default: false },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  type: { type: String, enum: ['fulltime', 'parttime', 'internship', 'contract'], required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postedDate: { type: Date, default: Date.now },
  deadline: Date,
  source: { type: String, enum: ['linkedin', 'indeed', 'manual'], default: 'manual' },
  url: String,
  active: { type: Boolean, default: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  matchCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for search
JobSchema.index({ title: 'text', description: 'text', company: 'text' });
JobSchema.index({ skills: 1 });
JobSchema.index({ active: 1, postedDate: -1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);