import mongoose from 'mongoose';

const SalarySchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
});

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  remote: { type: Boolean, default: false },
  salary: SalarySchema,
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  type: {
    type: String,
    enum: ['fulltime', 'parttime', 'internship', 'contract'],
    default: 'fulltime'
  },
  postedDate: { type: Date, default: Date.now },
  deadline: Date,
  source: {
    type: String,
    enum: ['linkedin', 'indeed', 'company', 'manual'],
    default: 'manual'
  },
  url: String,
  active: { type: Boolean, default: true },
  matchCount: { type: Number, default: 0 }
});

// Index for search optimization
JobSchema.index({ title: 'text', company: 'text', description: 'text' });
JobSchema.index({ skills: 1 });
JobSchema.index({ active: 1 });

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);