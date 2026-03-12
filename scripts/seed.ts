import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local file');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  notifications: Array
});

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: String,
  graduationYear: Number,
  skills: Array,
  experience: Array,
  education: Array,
  preferences: Object,
  matchScore: Number,
  status: String,
  createdBy: mongoose.Schema.Types.ObjectId
});

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  remote: Boolean,
  salary: Object,
  description: String,
  requirements: Array,
  skills: Array,
  type: String,
  postedBy: mongoose.Schema.Types.ObjectId,
  postedDate: Date,
  active: Boolean
});

async function seed() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await mongoose.connection.dropDatabase();
    console.log('🗑️ Database cleared');

    const User = mongoose.model('User', UserSchema);
    const Student = mongoose.model('Student', StudentSchema);
    const Job = mongoose.model('Job', JobSchema);

    // Hash password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    console.log('Creating admin user with hashed password...');
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eduplace.ai',
      password: hashedPassword,
      role: 'admin',
      notifications: []
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('Password hash:', hashedPassword.substring(0, 20) + '...');

    // Create sample students
    const students = await Student.create([
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        department: 'Computer Science',
        graduationYear: 2024,
        skills: [
          { name: 'Python', level: 'advanced', yearsOfExperience: 3 },
          { name: 'React', level: 'intermediate', yearsOfExperience: 2 },
          { name: 'Machine Learning', level: 'intermediate', yearsOfExperience: 1 }
        ],
        experience: [],
        education: [
          {
            institution: 'University of Technology',
            degree: 'Bachelor',
            field: 'Computer Science',
            startYear: 2020,
            endYear: 2024,
            grade: 'A'
          }
        ],
        preferences: {
          roles: ['Software Engineer', 'ML Engineer'],
          locations: ['San Francisco', 'Remote'],
          remote: true,
          salaryMin: 80000,
          salaryMax: 120000,
          jobType: 'fulltime'
        },
        matchScore: 98,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Alex Kumar',
        email: 'alex.kumar@example.com',
        department: 'Data Science',
        graduationYear: 2024,
        skills: [
          { name: 'Python', level: 'advanced', yearsOfExperience: 4 },
          { name: 'SQL', level: 'advanced', yearsOfExperience: 3 },
          { name: 'TensorFlow', level: 'intermediate', yearsOfExperience: 2 }
        ],
        experience: [
          {
            company: 'Tech Corp',
            role: 'Data Intern',
            startDate: new Date('2023-06-01'),
            endDate: new Date('2023-12-01'),
            description: 'Worked on data analysis projects'
          }
        ],
        education: [
          {
            institution: 'Data Science Institute',
            degree: 'Bachelor',
            field: 'Data Science',
            startYear: 2020,
            endYear: 2024,
            grade: 'A+'
          }
        ],
        preferences: {
          roles: ['Data Scientist', 'Data Analyst'],
          locations: ['New York', 'Remote'],
          remote: true,
          salaryMin: 85000,
          salaryMax: 130000,
          jobType: 'fulltime'
        },
        matchScore: 94,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        department: 'Cybersecurity',
        graduationYear: 2025,
        skills: [
          { name: 'Network Security', level: 'advanced', yearsOfExperience: 3 },
          { name: 'Python', level: 'intermediate', yearsOfExperience: 2 },
          { name: 'Ethical Hacking', level: 'intermediate', yearsOfExperience: 2 }
        ],
        experience: [],
        education: [
          {
            institution: 'Security University',
            degree: 'Bachelor',
            field: 'Cybersecurity',
            startYear: 2021,
            endYear: 2025,
            grade: 'A-'
          }
        ],
        preferences: {
          roles: ['Security Analyst', 'Penetration Tester'],
          locations: ['Remote', 'Washington DC'],
          remote: true,
          salaryMin: 75000,
          salaryMax: 110000,
          jobType: 'fulltime'
        },
        matchScore: 82,
        status: 'training',
        createdBy: admin._id
      }
    ]);

    console.log(`✅ ${students.length} sample students created`);

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Senior Software Engineer',
        company: 'Google',
        location: 'Mountain View, CA',
        remote: false,
        salary: { min: 150000, max: 220000, currency: 'USD' },
        description: 'Looking for an experienced software engineer to join our team...',
        requirements: ['5+ years experience', 'Strong system design skills'],
        skills: ['Python', 'Java', 'System Design', 'Cloud'],
        type: 'fulltime',
        postedBy: admin._id,
        postedDate: new Date(),
        active: true
      },
      {
        title: 'Data Scientist',
        company: 'Microsoft',
        location: 'Redmond, WA',
        remote: true,
        salary: { min: 140000, max: 200000, currency: 'USD' },
        description: 'Join our AI research team...',
        requirements: ['ML experience', 'PhD preferred'],
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        type: 'fulltime',
        postedBy: admin._id,
        postedDate: new Date(),
        active: true
      },
      {
        title: 'Security Analyst',
        company: 'AWS',
        location: 'Seattle, WA',
        remote: true,
        salary: { min: 120000, max: 180000, currency: 'USD' },
        description: 'Protect AWS infrastructure...',
        requirements: ['Security certifications', 'Cloud security'],
        skills: ['Network Security', 'AWS', 'Python'],
        type: 'fulltime',
        postedBy: admin._id,
        postedDate: new Date(),
        active: true
      }
    ]);

    console.log(`✅ ${jobs.length} sample jobs created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@eduplace.ai');
    console.log('   Password: admin123');
    console.log('\n👥 Sample students created:', students.length);
    console.log('💼 Sample jobs created:', jobs.length);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();