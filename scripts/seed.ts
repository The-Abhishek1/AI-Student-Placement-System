import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local file');
  process.exit(1);
}

// Define schemas
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

    // Create models
    const User = mongoose.model('User', UserSchema);
    const Student = mongoose.model('Student', StudentSchema);
    const Job = mongoose.model('Job', JobSchema);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eduplace.ai',
      password: hashedPassword,
      role: 'admin',
      notifications: []
    });

    console.log('✅ Admin user created:', admin.email);

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
        description: 'Looking for an experienced software engineer to join our team. You will work on core products used by millions of users worldwide.',
        requirements: ['5+ years experience', 'Strong system design skills', 'Bachelor\'s in CS or related field'],
        skills: ['Python', 'Java', 'System Design', 'Cloud', 'Distributed Systems'],
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
        description: 'Join our AI research team to work on cutting-edge machine learning models and applications.',
        requirements: ['MS or PhD in CS/ML', 'Experience with deep learning', 'Publications preferred'],
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch'],
        type: 'fulltime',
        postedBy: admin._id,
        postedDate: new Date(),
        active: true
      },
      {
        title: 'Security Analyst',
        company: 'Amazon Web Services',
        location: 'Seattle, WA',
        remote: true,
        salary: { min: 120000, max: 180000, currency: 'USD' },
        description: 'Protect AWS infrastructure and services from security threats. Conduct security assessments and incident response.',
        requirements: ['Security certifications', 'Experience with cloud security', 'Incident response skills'],
        skills: ['Network Security', 'AWS', 'Python', 'Incident Response', 'Compliance'],
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
    console.log('\n👥 Sample students created:');
    students.forEach(s => console.log(`   - ${s.name} (${s.department})`));
    console.log('\n💼 Sample jobs created:');
    jobs.forEach(j => console.log(`   - ${j.title} at ${j.company}`));

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();