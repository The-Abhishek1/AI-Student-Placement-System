import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/app/lib/db/mongodb';
import Student from '@/app/lib/db/models/Student';
import Job from '@/app/lib/db/models/Job';
import Match from '@/app/lib/db/models/Match';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NotificationService } from '@/app/lib/notifications/notificationService';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Skill weight mapping for different job types
const SKILL_WEIGHTS: { [key: string]: { [key: string]: number } } = {
  'software engineer': {
    'Python': 1.2,
    'Java': 1.2,
    'JavaScript': 1.1,
    'React': 1.1,
    'System Design': 1.3,
    'Algorithms': 1.2,
    'Data Structures': 1.2,
    'Cloud': 1.1,
    'Docker': 1.0,
    'Kubernetes': 1.0
  },
  'data scientist': {
    'Python': 1.3,
    'SQL': 1.2,
    'Machine Learning': 1.3,
    'Statistics': 1.2,
    'TensorFlow': 1.2,
    'PyTorch': 1.2,
    'R': 1.1,
    'Data Visualization': 1.1,
    'Big Data': 1.1
  },
  'security analyst': {
    'Network Security': 1.3,
    'Python': 1.1,
    'Linux': 1.2,
    'AWS': 1.1,
    'Penetration Testing': 1.3,
    'Incident Response': 1.2,
    'Compliance': 1.1
  }
};

function calculateSkillMatch(studentSkills: any[], jobSkills: string[], jobTitle: string): number {
  if (!jobSkills.length) return 50;
  
  const weights = SKILL_WEIGHTS[jobTitle.toLowerCase()] || {};
  let totalScore = 0;
  let maxPossible = 0;
  
  for (const jobSkill of jobSkills) {
    const weight = weights[jobSkill] || 1.0;
    maxPossible += 100 * weight;
    
    const matchingSkill = studentSkills.find(s => 
      s.name.toLowerCase() === jobSkill.toLowerCase()
    );
    
    if (matchingSkill) {
      // Level to percentage mapping
      const levelScore = {
        'beginner': 40,
        'intermediate': 60,
        'advanced': 80,
        'expert': 100
      }[matchingSkill.level] || 50;
      
      // Experience bonus
      const expBonus = Math.min(20, matchingSkill.yearsOfExperience * 5);
      
      totalScore += Math.min(100, levelScore + expBonus) * weight;
    }
  }
  
  return maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 50;
}

function calculateExperienceMatch(studentExp: any[], jobRequirements: string[]): number {
  if (!studentExp.length) return 30;
  if (!jobRequirements.length) return 70;
  
  const totalYears = studentExp.reduce((sum, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return sum + years;
  }, 0);
  
  // Extract required years from job requirements
  const yearMatch = jobRequirements.join(' ').match(/(\d+)\+?\s*years?/i);
  const requiredYears = yearMatch ? parseInt(yearMatch[1]) : 2;
  
  const yearScore = Math.min(100, (totalYears / requiredYears) * 100);
  
  // Check for relevant experience keywords
  const keywordScore = jobRequirements.some(req => 
    studentExp.some(exp => 
      exp.description.toLowerCase().includes(req.toLowerCase().slice(0, 20))
    )
  ) ? 80 : 40;
  
  return Math.round((yearScore + keywordScore) / 2);
}

function calculateEducationMatch(studentEdu: any[], jobRequirements: string[]): number {
  if (!studentEdu.length) return 50;
  
  const latestEdu = studentEdu[studentEdu.length - 1];
  let score = 70; // Base score
  
  // Check degree level
  if (latestEdu.degree?.toLowerCase().includes('master')) score += 20;
  else if (latestEdu.degree?.toLowerCase().includes('bachelor')) score += 10;
  else if (latestEdu.degree?.toLowerCase().includes('phd')) score += 30;
  
  // Check field relevance
  const field = latestEdu.field?.toLowerCase() || '';
  if (jobRequirements.some(req => field.includes(req.toLowerCase().slice(0, 10)))) {
    score += 15;
  }
  
  // Check grades
  if (latestEdu.grade) {
    if (latestEdu.grade.includes('A')) score += 10;
    else if (latestEdu.grade.includes('B')) score += 5;
  }
  
  return Math.min(100, score);
}

function calculateLocationMatch(studentPref: any, jobLocation: string, jobRemote: boolean): number {
  if (jobRemote) return 100;
  if (!studentPref?.locations?.length) return 70;
  
  if (studentPref.locations.some((loc: string) => 
    jobLocation.toLowerCase().includes(loc.toLowerCase())
  )) {
    return 100;
  }
  
  return 40;
}

function calculateSalaryMatch(studentPref: any, jobSalary: any): number {
  if (!studentPref?.salaryMin || !jobSalary?.max) return 70;
  
  const studentMin = studentPref.salaryMin;
  const jobMax = jobSalary.max;
  
  if (jobMax >= studentMin) {
    const ratio = studentMin / jobMax;
    if (ratio <= 0.8) return 100;
    if (ratio <= 0.9) return 90;
    if (ratio <= 1.0) return 80;
    return 60;
  }
  
  return 40;
}

function calculateCulturalMatch(student: any, job: any): number {
  let score = 70; // Base score
  
  // Check job type preference
  if (student.preferences?.jobType === job.type) score += 15;
  else if (!student.preferences?.jobType) score += 5;
  
  // Check remote preference
  if (student.preferences?.remote === job.remote) score += 10;
  
  // Check graduation year (recent graduates)
  const currentYear = new Date().getFullYear();
  if (student.graduationYear >= currentYear - 2) score += 5;
  
  return Math.min(100, score);
}

function generateStrengths(match: any, student: any, job: any): string[] {
  const strengths = [];
  
  if (match.breakdown.skills >= 80) {
    strengths.push(`Strong technical skills matching job requirements (${match.breakdown.skills}% match)`);
  }
  
  if (match.breakdown.experience >= 80) {
    strengths.push(`Relevant experience level (${match.breakdown.experience}% match)`);
  }
  
  if (match.breakdown.education >= 80) {
    const latestEdu = student.education[student.education.length - 1];
    strengths.push(`Educational background in ${latestEdu?.field || 'relevant field'}`);
  }
  
  if (match.breakdown.cultural >= 80) {
    strengths.push('Strong cultural fit with the organization');
  }
  
  if (student.skills.some((s: any) => s.level === 'expert')) {
    const expertSkills = student.skills.filter((s: any) => s.level === 'expert').map((s: any) => s.name);
    strengths.push(`Expert-level proficiency in ${expertSkills.join(', ')}`);
  }
  
  return strengths;
}

function generateGaps(match: any, student: any, job: any): string[] {
  const gaps = [];
  
  if (match.breakdown.skills < 70) {
    const missingSkills = job.skills.filter((js: string) => 
      !student.skills.some((ss: any) => ss.name.toLowerCase() === js.toLowerCase())
    );
    if (missingSkills.length) {
      gaps.push(`Missing key skills: ${missingSkills.slice(0, 3).join(', ')}`);
    }
  }
  
  if (match.breakdown.experience < 60) {
    gaps.push('Less experience than typically required for this role');
  }
  
  if (match.breakdown.location < 50) {
    gaps.push('Location mismatch - consider remote opportunities');
  }
  
  if (match.breakdown.salary < 60) {
    gaps.push('Salary expectations above typical range for this role');
  }
  
  return gaps;
}

function generateRecommendations(match: any, student: any, job: any): string[] {
  const recommendations = [];
  
  if (match.breakdown.skills < 80) {
    const missingSkills = job.skills.filter((js: string) => 
      !student.skills.some((ss: any) => ss.name.toLowerCase() === js.toLowerCase())
    );
    if (missingSkills.length) {
      recommendations.push(`Consider upskilling in: ${missingSkills.slice(0, 3).join(', ')}`);
    }
  }
  
  if (match.breakdown.experience < 70) {
    recommendations.push('Highlight relevant projects and internships in your resume');
  }
  
  if (student.preferences?.salaryMin > job.salary?.max * 1.2) {
    recommendations.push('Adjust salary expectations based on market rates');
  }
  
  if (job.remote && !student.preferences?.remote) {
    recommendations.push('This role offers remote work - consider updating your preferences');
  }
  
  recommendations.push(`Research ${job.company}'s culture and recent projects before interview`);
  recommendations.push('Prepare specific examples of your work related to ' + job.skills.slice(0, 2).join(' and '));
  
  return recommendations;
}

function generateInterviewQuestions(match: any, student: any, job: any): string[] {
  const questions = [];
  
  // Technical questions based on skills
  const topSkills = job.skills.slice(0, 3);
  for (const skill of topSkills) {
    const studentSkill = student.skills.find((s: any) => 
      s.name.toLowerCase() === skill.toLowerCase()
    );
    if (studentSkill) {
      if (studentSkill.level === 'expert') {
        questions.push(`Can you describe a complex project where you used ${skill} at an expert level?`);
      } else if (studentSkill.level === 'advanced') {
        questions.push(`How have you applied ${skill} in real-world scenarios?`);
      } else {
        questions.push(`What's your experience with ${skill} and how would you rate your proficiency?`);
      }
    } else {
      questions.push(`While you don't have ${skill} listed, how would you approach learning it for this role?`);
    }
  }
  
  // Experience-based questions
  if (student.experience.length > 0) {
    const latestExp = student.experience[student.experience.length - 1];
    questions.push(`Tell me about your role at ${latestExp.company} and your biggest achievement there.`);
  }
  
  // Behavioral questions
  questions.push('Describe a challenging technical problem you solved and your approach.');
  questions.push('How do you stay updated with the latest industry trends and technologies?');
  questions.push(`Why are you interested in working at ${job.company} specifically?`);
  
  return questions.slice(0, 5);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { studentId, minScore = 70, model = 'gemini' } = await request.json();

    // Fetch students to match
    let studentsToMatch: any[] = [];
    if (studentId && studentId !== 'all') {
      const student = await Student.findById(studentId);
      if (student) studentsToMatch = [student];
    } else {
      studentsToMatch = await Student.find({ status: 'active' }).lean();
    }

    // Fetch active jobs
    const jobs = await Job.find({ active: true }).lean();

    if (!studentsToMatch.length || !jobs.length) {
      return NextResponse.json(
        { success: false, error: 'No students or jobs to match' },
        { status: 400 }
      );
    }

    const matches: MatchResult[] = [];
    const batchSize = 10; // Process in batches to avoid overwhelming

    for (let i = 0; i < studentsToMatch.length; i += batchSize) {
      const studentBatch = studentsToMatch.slice(i, i + batchSize);
      
      for (const student of studentBatch) {
        for (const job of jobs) {
          // Calculate match scores
          const skillMatch = calculateSkillMatch(student.skills || [], job.skills || [], job.title);
          const experienceMatch = calculateExperienceMatch(student.experience || [], job.requirements || []);
          const educationMatch = calculateEducationMatch(student.education || [], job.requirements || []);
          const locationMatch = calculateLocationMatch(student.preferences, job.location, job.remote);
          const salaryMatch = calculateSalaryMatch(student.preferences, job.salary);
          const culturalMatch = calculateCulturalMatch(student, job);
          
          // Weighted overall score
          const overallScore = Math.round(
            skillMatch * 0.35 +
            experienceMatch * 0.25 +
            educationMatch * 0.15 +
            locationMatch * 0.1 +
            salaryMatch * 0.1 +
            culturalMatch * 0.05
          );

          if (overallScore >= minScore) {
            const matchResult: MatchResult = {
              studentId: student._id.toString(),
              studentName: student.name,
              studentEmail: student.email,
              studentDept: student.department,
              jobId: job._id.toString(),
              jobTitle: job.title,
              company: job.company,
              score: overallScore,
              breakdown: {
                skills: skillMatch,
                experience: experienceMatch,
                education: educationMatch,
                location: locationMatch,
                salary: salaryMatch,
                cultural: culturalMatch
              },
              strengths: generateStrengths({ breakdown: { skills: skillMatch, experience: experienceMatch, education: educationMatch, cultural: culturalMatch } }, student, job),
              gaps: generateGaps({ breakdown: { skills: skillMatch, experience: experienceMatch, location: locationMatch, salary: salaryMatch } }, student, job),
              recommendations: generateRecommendations({ breakdown: { skills: skillMatch, experience: experienceMatch, salary: salaryMatch } }, student, job),
              interviewQuestions: generateInterviewQuestions({ breakdown: { skills: skillMatch } }, student, job),
              estimatedSalary: Math.round((job.salary?.min + job.salary?.max) / 2000) * 1000,
              matchDate: new Date()
            };

            matches.push(matchResult);

            // Save to database
            try {
              await Match.create({
                studentId: student._id,
                jobId: job._id,
                score: overallScore,
                breakdown: matchResult.breakdown,
                recommendations: matchResult.recommendations,
                status: 'pending'
              });
            } catch (dbError) {
              console.error('Error saving match to DB:', dbError);
            }
          }
        }
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);

    // Send notification for top matches
    if (matches.length > 0) {
      await NotificationService.sendNotification({
        type: 'match',
        title: 'New AI Matches Found',
        message: `Found ${matches.length} high-quality matches with average score ${Math.round(matches.reduce((acc, m) => acc + m.score, 0) / matches.length)}%`,
        userIds: [session.user.id],
        data: { matchCount: matches.length, topScore: matches[0].score }
      });
    }

    return NextResponse.json({
      success: true,
      matches: matches.slice(0, 50), // Return top 50 matches
      totalMatches: matches.length,
      stats: {
        avgScore: matches.length ? Math.round(matches.reduce((acc, m) => acc + m.score, 0) / matches.length) : 0,
        topScore: matches[0]?.score || 0,
        excellentMatches: matches.filter(m => m.score >= 90).length,
        goodMatches: matches.filter(m => m.score >= 80 && m.score < 90).length
      }
    });
  } catch (error) {
    console.error('AI Match error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process match' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (studentId) query.studentId = studentId;

    const matches = await Match.find(query)
      .populate('studentId', 'name email department')
      .populate('jobId', 'title company salary')
      .sort({ score: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedMatches = matches.map((match: any) => ({
      studentName: match.studentId?.name,
      studentEmail: match.studentId?.email,
      jobTitle: match.jobId?.title,
      company: match.jobId?.company,
      score: match.score,
      createdAt: match.createdAt
    }));

    return NextResponse.json({
      success: true,
      matches: formattedMatches,
      count: formattedMatches.length
    });
  } catch (error) {
    console.error('Fetch matches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}