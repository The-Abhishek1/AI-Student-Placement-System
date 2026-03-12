import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import Job from '@/app/lib/db/models/Job';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const jobData = await request.json();

    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = await Job.create({
      title: jobData.title,
      company: jobData.company,
      location: jobData.location || 'Remote',
      remote: jobData.remote || false,
      salary: jobData.salary || { min: 0, max: 0, currency: 'USD' },
      description: jobData.description,
      requirements: jobData.requirements || [],
      skills: jobData.skills || [],
      type: jobData.type || 'fulltime',
      postedBy: session.user.id,
      postedDate: new Date(),
      source: jobData.source || 'manual',
      active: true,
      applicants: 0
    });

    return NextResponse.json({
      success: true,
      job,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updates = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}