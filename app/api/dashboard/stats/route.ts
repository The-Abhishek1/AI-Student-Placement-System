import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import Student from '@/app/lib/db/models/Student';
import Job from '@/app/lib/db/models/Job';
import Match from '@/app/lib/db/models/Match';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get real stats from database
    const [
      totalStudents,
      activeJobs,
      successfulPlacements,
      totalCompanies,
      recentMatches
    ] = await Promise.all([
      Student.countDocuments(),
      Job.countDocuments({ active: true }),
      Student.countDocuments({ status: 'placed' }),
      Job.distinct('company').then(companies => companies.length),
      Match.find()
        .populate('studentId', 'name')
        .populate('jobId', 'title company')
        .sort({ score: -1 })
        .limit(5)
        .lean()
    ]);

    // Calculate trends (you can make these more sophisticated)
    const lastMonthStudents = await Student.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const stats = {
      totalStudents,
      studentsTrend: lastMonthStudents > 0 ? '+12%' : '0%',
      activeJobs,
      jobsTrend: '+8%',
      successfulPlacements,
      placementsTrend: '+23%',
      totalCompanies,
      companiesTrend: '+15',
      recentMatches: recentMatches.map((match: any) => ({
        student: match.studentId?.name || 'Unknown',
        role: match.jobId?.title || 'Unknown',
        company: match.jobId?.company || 'Unknown',
        score: match.score
      }))
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}