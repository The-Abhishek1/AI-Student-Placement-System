import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import Student from '@/app/lib/db/models/Student';
import { NotificationService } from '@/app/lib/notifications/notificationService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    if (department && department !== 'all') query.department = department;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate match scores for each student (simple algorithm for now)
    const studentsWithScores = students.map(student => ({
      ...student,
      matchScore: student.matchScore || Math.floor(Math.random() * 30) + 70 // Temporary random score between 70-100
    }));

    return NextResponse.json({
      success: true,
      students: studentsWithScores,
      count: studentsWithScores.length
    });
  } catch (error) {
    console.error('Fetch students error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
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
    const studentData = await request.json();

    console.log('Received student data:', studentData); // Debug log

    // Validate required fields
    if (!studentData.name || !studentData.email || !studentData.department) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, email, and department are required' 
        },
        { status: 400 }
      );
    }

    // Check if student with this email already exists
    const existingStudent = await Student.findOne({ email: studentData.email });
    if (existingStudent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student with this email already exists' 
        },
        { status: 409 }
      );
    }

    // Prepare student data with defaults
    const newStudent = {
      name: studentData.name,
      email: studentData.email,
      department: studentData.department,
      graduationYear: studentData.graduationYear || new Date().getFullYear(),
      skills: studentData.skills || [],
      experience: studentData.experience || [],
      education: studentData.education || [],
      preferences: studentData.preferences || {
        roles: [],
        locations: [],
        remote: false,
        salaryMin: 0,
        salaryMax: 0,
        jobType: 'fulltime'
      },
      matchScore: studentData.matchScore || 0,
      status: studentData.status || 'active',
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating student:', newStudent); // Debug log

    const student = await Student.create(newStudent);

    // Send notification
    try {
      await NotificationService.sendNotification({
        type: 'system',
        title: 'New Student Added',
        message: `${student.name} has been added to the system`,
        userIds: [session.user.id],
        sendEmail: false
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      student,
      message: 'Student created successfully'
    });
  } catch (error: any) {
    console.error('Student creation error:', error);
    
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

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student with this email already exists' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create student: ' + error.message 
      },
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
        { error: 'Student ID required' },
        { status: 400 }
      );
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
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
        { error: 'Student ID required' },
        { status: 400 }
      );
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
      message: 'Student updated successfully'
    });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Failed to update student: ' + error.message },
      { status: 500 }
    );
  }
}