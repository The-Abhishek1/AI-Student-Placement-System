import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true 
  },
  yearsOfExperience: { type: Number, default: 0 },
  certifications: [String]
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  description: String,
  skillsUsed: [String]
});

const EducationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: Number,
  grade: String
});

const JobPreferencesSchema = new mongoose.Schema({
  roles: [String],
  locations: [String],
  remote: { type: Boolean, default: false },
  salaryMin: Number,
  salaryMax: Number,
  jobType: {
    type: String,
    enum: ['fulltime', 'parttime', 'internship', 'contract']
  }
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  skills: [SkillSchema],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  preferences: JobPreferencesSchema,
  matchScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'placed', 'training'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
StudentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);