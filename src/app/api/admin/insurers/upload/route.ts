import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: Request) {
  /*
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  */

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'insurers');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    // Generate unique filename
    const filename = file.name.replace(/\s+/g, '-').toLowerCase();
    const cleanFilename = filename.split('.')[0] + '-' + Date.now() + '.webp';
    const filePath = path.join(uploadDir, cleanFilename);

    // Process with sharp
    await sharp(buffer)
      .resize(400, 200, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(filePath);

    return NextResponse.json({ 
      success: true, 
      path: `/insurers/${cleanFilename}` 
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ error: 'Failed to process logo' }, { status: 500 });
  }
}
