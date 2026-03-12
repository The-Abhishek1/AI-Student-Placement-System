import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import { NotificationService } from '@/app/lib/notifications/notificationService';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('notifications');
    
    return NextResponse.json({
      success: true,
      notifications: user?.notifications || [],
      unreadCount: await NotificationService.getUnreadCount(session.user.id)
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
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

    const { notificationId, markAll } = await request.json();

    if (markAll) {
      await NotificationService.markAllAsRead(session.user.id);
    } else if (notificationId) {
      await NotificationService.markAsRead(session.user.id, notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification' },
      { status: 500 }
    );
  }
}