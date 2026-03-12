import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import Student from '@/app/lib/db/models/Student';
import Job from '@/app/lib/db/models/Job';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchRegex = new RegExp(query, 'i');

    // Search students
    const students = await Student.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex }
      ]
    })
    .limit(5)
    .select('name email department')
    .lean();

    // Search jobs
    const jobs = await Job.find({
      $or: [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex }
      ]
    })
    .limit(5)
    .select('title company location')
    .lean();

    const results = [
      ...students.map(s => ({
        title: s.name,
        subtitle: `${s.department} • ${s.email}`,
        url: `/students?id=${s._id}`,
        type: 'student'
      })),
      ...jobs.map(j => ({
        title: j.title,
        subtitle: `${j.company} • ${j.location || 'Remote'}`,
        url: `/jobs?id=${j._id}`,
        type: 'job'
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}