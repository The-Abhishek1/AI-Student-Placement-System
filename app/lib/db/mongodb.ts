import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in environment variables');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Student Schema
const StudentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  department: String,
  graduationYear: Number,
  skills: [{
    name: String,
    level: String,
    yearsOfExperience: Number
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number
  }],
  preferences: {
    roles: [String],
    locations: [String],
    remote: Boolean,
    salaryMin: Number,
    salaryMax: Number,
    jobType: String
  },
  matchScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Job Schema
const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  remote: Boolean,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  description: String,
  requirements: [String],
  skills: [String],
  postedDate: Date,
  source: String,
  url: String,
  active: { type: Boolean, default: true }
});

// Match Schema
const MatchSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  score: Number,
  breakdown: {
    skills: Number,
    experience: Number,
    education: Number,
    location: Number,
    salary: Number
  },
  recommendations: [String],
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export default connectDB;