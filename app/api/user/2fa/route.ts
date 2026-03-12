import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { enabled, token } = await request.json();

    // Find user and explicitly select twoFactorSecret
    const user = await User.findById(session.user.id).select('+twoFactorSecret');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (enabled && !user.twoFactorEnabled) {
      // Generate new secret
      const secret = speakeasy.generateSecret({
        name: `EduPlace AI (${user.email})`,
        issuer: 'EduPlace AI'
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Save secret temporarily (not enabled yet)
      user.twoFactorSecret = secret.base32;
      await user.save();

      return NextResponse.json({
        success: true,
        qrCode,
        secret: secret.base32,
        message: 'Scan QR code with Google Authenticator'
      });
    }

    if (enabled && token && user.twoFactorSecret) {
      // Verify token and enable 2FA
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1
      });

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      user.twoFactorEnabled = true;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication enabled'
      });
    }

    if (!enabled && user.twoFactorEnabled) {
      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication disabled'
      });
    }

    return NextResponse.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled || false
    });
  } catch (error) {
    console.error('2FA error:', error);
    return NextResponse.json(
      { error: 'Failed to configure 2FA' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('twoFactorEnabled');

    return NextResponse.json({
      success: true,
      twoFactorEnabled: user?.twoFactorEnabled || false
    });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    );
  }
}