import mongoose from 'mongoose';

const MatchBreakdownSchema = new mongoose.Schema({
  skills: { type: Number, required: true },
  experience: { type: Number, required: true },
  education: { type: Number, required: true },
  location: { type: Number, required: true },
  salary: { type: Number, required: true }
});

const MatchSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true 
  },
  score: { type: Number, required: true, min: 0, max: 100 },
  breakdown: { type: MatchBreakdownSchema, required: true },
  recommendations: [String],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure one match per student-job pair
MatchSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);