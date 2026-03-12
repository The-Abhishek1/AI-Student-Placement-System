import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = path.extname(file.name);
    const filename = `avatar-${session.user.id}-${uuidv4()}${ext}`;
    
    // Define paths
    const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');
    const filepath = path.join(uploadDir, filename);
    
    // Public URL path (what the browser will request)
    const avatarUrl = `/uploads/avatars/${filename}`;

    console.log('Saving avatar to:', filepath);
    console.log('Avatar URL:', avatarUrl);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    await writeFile(filepath, buffer);

    // Update user in database
    await connectDB();
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        avatar: avatarUrl,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User updated with avatar:', updatedUser.avatar);

    return NextResponse.json({
      success: true,
      url: avatarUrl,
      user: updatedUser,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get current user to find avatar path
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete avatar file if it exists
    if (user.avatar) {
      const filename = path.basename(user.avatar);
      const filepath = path.join(process.cwd(), 'public/uploads/avatars', filename);
      
      try {
        await fs.unlink(filepath);
        console.log('Deleted avatar file:', filepath);
      } catch (err) {
        console.log('Avatar file not found, skipping deletion');
      }
    }

    // Update user
    user.avatar = '';
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    });
  } catch (error) {
    console.error('Avatar deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}