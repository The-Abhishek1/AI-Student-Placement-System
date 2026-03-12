import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import path from 'path';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const filename = params.filename;
    const filepath = path.join(process.cwd(), 'public/uploads/avatars', filename);

    try {
      const file = await fs.readFile(filepath);
      const ext = path.extname(filename).toLowerCase();
      
      // Determine content type
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }[ext] || 'application/octet-stream';

      return new NextResponse(file, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      return new NextResponse('Avatar not found', { status: 404 });
    }
  } catch (error) {
    console.error('Avatar serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}