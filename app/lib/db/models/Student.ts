import mongoose from 'mongoose';

export interface IStudent extends mongoose.Document {
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  skills: ISkill[];
  experience: IExperience[];
  education: IEducation[];
  preferences: IJobPreferences;
  matchScore: number;
  status: 'active' | 'placed' | 'training';
  placedAt?: Date;
  placedCompany?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

export interface IExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  grade?: string;
}

export interface IJobPreferences {
  roles: string[];
  locations: string[];
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  jobType: 'fulltime' | 'parttime' | 'internship' | 'contract';
}

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
  yearsOfExperience: { type: Number, default: 0 }
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  description: String
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
  jobType: { type: String, enum: ['fulltime', 'parttime', 'internship', 'contract'] }
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  skills: [SkillSchema],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  preferences: JobPreferencesSchema,
  matchScore: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'placed', 'training'], default: 'active' },
  placedAt: Date,
  placedCompany: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);