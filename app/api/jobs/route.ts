import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import Job from '@/app/lib/db/models/Job';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('No session found for job creation');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    console.log('Session user for job creation:', session.user);

    await connectDB();
    const jobData = await request.json();

    console.log('Received job data:', jobData);

    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: title, company, and description are required' 
        },
        { status: 400 }
      );
    }

    // Prepare job data with defaults and session user ID
    const newJob = {
      title: jobData.title.trim(),
      company: jobData.company.trim(),
      location: jobData.location?.trim() || 'Remote',
      remote: jobData.remote || false,
      salary: {
        min: Number(jobData.salary?.min) || 0,
        max: Number(jobData.salary?.max) || 0,
        currency: jobData.salary?.currency || 'USD'
      },
      description: jobData.description.trim(),
      requirements: jobData.requirements?.filter((r: string) => r.trim() !== '') || [],
      skills: jobData.skills?.filter((s: string) => s.trim() !== '') || [],
      type: jobData.type || 'fulltime',
      postedBy: session.user.id, // This is crucial - set from session
      postedDate: new Date(),
      source: jobData.source || 'manual',
      active: true,
      applicants: [] // Initialize as empty array, not with 0
    };

    console.log('Creating job with postedBy:', session.user.id);

    const job = await Job.create(newJob);

    return NextResponse.json({
      success: true,
      job,
      message: 'Job created successfully'
    });
  } catch (error: any) {
    console.error('Job creation error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create job: ' + (error.message || 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.postedBy;
    delete updates.postedDate;

    const job = await Job.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
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
  } catch (error: any) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { error: 'Failed to update job: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}