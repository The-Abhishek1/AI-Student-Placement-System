import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Generate new API key and secret
    const apiKey = 'sk_live_' + crypto.randomBytes(16).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');

    // Update user
    await User.findByIdAndUpdate(session.user.id, {
      apiKey,
      apiSecret,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      key: apiKey,
      secret: apiSecret,
      message: 'API key regenerated successfully'
    });
  } catch (error) {
    console.error('API key regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate API key' },
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

    // Revoke API key
    await User.findByIdAndUpdate(session.user.id, {
      apiKey: null,
      apiSecret: null,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('API key revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}