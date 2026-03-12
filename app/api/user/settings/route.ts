import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Select all fields except password
    const user = await User.findById(session.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure all settings objects exist with defaults
    const response = {
      success: true,
      profile: {
        id: user._id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'institution',
        institution: user.institution || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        phone: user.phone || '',
        department: user.department || '',
        createdAt: user.createdAt || new Date()
      },
      notifications: {
        emailAlerts: user.notificationSettings?.emailAlerts ?? true,
        matchUpdates: user.notificationSettings?.matchUpdates ?? true,
        jobAlerts: user.notificationSettings?.jobAlerts ?? true,
        placementUpdates: user.notificationSettings?.placementUpdates ?? true,
        marketingEmails: user.notificationSettings?.marketingEmails ?? false,
        browserNotifications: user.notificationSettings?.browserNotifications ?? true,
        mobileNotifications: user.notificationSettings?.mobileNotifications ?? false,
        digestFrequency: user.notificationSettings?.digestFrequency || 'weekly'
      },
      security: {
        twoFactorEnabled: user.twoFactorEnabled || false,
        lastPasswordChange: user.lastPasswordChange || new Date().toISOString(),
        lastLogin: user.lastLogin || new Date().toISOString(),
        loginHistory: user.loginHistory || [],
        activeSessions: user.activeSessions || []
      },
      api: {
        apiKey: user.apiKey || '',
        apiSecret: user.apiSecret ? '••••••••••••••••' : '',
        whitelistedIPs: user.whitelistedIPs || [],
        rateLimit: user.rateLimit || 1000,
        usageThisMonth: user.apiUsage || 0,
        endpoints: user.apiEndpoints || [
          { path: '/api/students', method: 'GET', calls: 0, lastCalled: 'Never' },
          { path: '/api/jobs', method: 'GET', calls: 0, lastCalled: 'Never' },
          { path: '/api/ai-match', method: 'POST', calls: 0, lastCalled: 'Never' }
        ]
      },
      appearance: {
        theme: user.appearance?.theme || 'dark',
        primaryColor: user.appearance?.primaryColor || '#3B82F6',
        fontSize: user.appearance?.fontSize || 'medium',
        compactMode: user.appearance?.compactMode || false,
        animations: user.appearance?.animations ?? true,
        sidebarCollapsed: user.appearance?.sidebarCollapsed || false
      },
      integrations: user.integrations || [
        { id: 'linkedin', name: 'LinkedIn', description: 'Import jobs and candidates from LinkedIn', icon: '🔗', connected: false },
        { id: 'indeed', name: 'Indeed', description: 'Sync job postings from Indeed', icon: '💼', connected: false },
        { id: 'slack', name: 'Slack', description: 'Get notifications in Slack', icon: '💬', connected: false },
        { id: 'google-calendar', name: 'Google Calendar', description: 'Schedule interviews automatically', icon: '📅', connected: false },
        { id: 'zoom', name: 'Zoom', description: 'Create interview meetings', icon: '🎥', connected: false },
        { id: 'salesforce', name: 'Salesforce', description: 'Sync placement data with CRM', icon: '☁️', connected: false }
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const updates = await request.json();

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (updates.profile) {
      updateData.name = updates.profile.name;
      updateData.email = updates.profile.email;
      updateData.phone = updates.profile.phone;
      updateData.department = updates.profile.department;
      updateData.institution = updates.profile.institution;
      updateData.bio = updates.profile.bio;
    }

    if (updates.notifications) {
      updateData.notificationSettings = updates.notifications;
    }

    if (updates.appearance) {
      updateData.appearance = updates.appearance;
    }

    if (updates.api) {
      updateData.whitelistedIPs = updates.api.whitelistedIPs;
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      user
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}