import { NextResponse } from 'next/server';
import { AIService } from '@/app/lib/ai/gemini';
import connectDB, { Student, Job, Match } from '@/app/lib/db/mongodb';

const aiService = new AIService();

export async function POST(request: Request) {
  try {
    await connectDB();
    const { studentId } = await request.json();

    // Get student profile
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get matching jobs
    const jobs = await Job.find({ active: true });
    
    // AI-powered matching
    const matches = [];
    for (const job of jobs) {
      const matchResult = await aiService.matchJobWithStudent(student, job);
      
      // Save match to database
      const match = await Match.create({
        studentId: student._id,
        jobId: job._id,
        score: matchResult.overall,
        breakdown: matchResult.breakdown,
        recommendations: matchResult.recommendations
      });
      
      matches.push({
        job,
        matchResult,
        matchId: match._id
      });
    }

    // Sort by match score
    matches.sort((a, b) => b.matchResult.overall - a.matchResult.overall);

    return NextResponse.json({
      success: true,
      matches: matches.slice(0, 10), // Top 10 matches
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('AI Match error:', error);
    return NextResponse.json({ error: 'Failed to process match' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Get existing matches with AI analysis
    const matches = await Match.find({ studentId })
      .populate('studentId')
      .populate('jobId')
      .sort({ score: -1 });

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Fetch matches error:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}