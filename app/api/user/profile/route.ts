import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { name, email, phone, department, institution, bio } = await request.json();

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: session.user.id } 
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        email,
        phone,
        department,
        institution,
        bio,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}