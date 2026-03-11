export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  preferences: JobPreferences;
  matchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications?: string[];
}

export interface Experience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skillsUsed: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  grade?: string;
}

export interface JobPreferences {
  roles: string[];
  locations: string[];
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  jobType: 'fulltime' | 'parttime' | 'internship' | 'contract';
}

export interface Job {
  id: string;
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
  postedDate: Date;
  deadline?: Date;
  source: 'linkedin' | 'indeed' | 'company' | 'manual';
  url?: string;
}

export interface MatchResult {
  studentId: string;
  jobId: string;
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    salary: number;
  };
  recommendations: string[];
  matchedAt: Date;
}

export interface SkillGap {
  skill: string;
  currentLevel: string;
  requiredLevel: string;
  gap: number;
  resources: LearningResource[];
}

export interface LearningResource {
  title: string;
  type: 'course' | 'tutorial' | 'certification' | 'project';
  provider: string;
  url: string;
  duration: string;
  cost: 'free' | 'paid';
}