import mongoose from 'mongoose';

export interface IMatch extends mongoose.Document {
  studentId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    salary: number;
  };
  recommendations: string[];
  status: 'pending' | 'reviewed' | 'interviewing' | 'accepted' | 'rejected';
  viewedByStudent: boolean;
  viewedByInstitution: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  breakdown: {
    skills: { type: Number, required: true },
    experience: { type: Number, required: true },
    education: { type: Number, required: true },
    location: { type: Number, required: true },
    salary: { type: Number, required: true }
  },
  recommendations: [String],
  status: { type: String, enum: ['pending', 'reviewed', 'interviewing', 'accepted', 'rejected'], default: 'pending' },
  viewedByStudent: { type: Boolean, default: false },
  viewedByInstitution: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

// Ensure one match per student-job pair
MatchSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);