import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
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

    // Process with sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(400, 200, { fit: 'inside' })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const filename = file.name.replace(/\s+/g, '-').toLowerCase();
    const cleanFilename = filename.split('.')[0] + '-' + Date.now() + '.webp';

    // Upload to Vercel Blob
    const blob = await put(`insurers/${cleanFilename}`, optimizedBuffer, {
      access: 'public',
    });

    return NextResponse.json({ 
      success: true, 
      path: blob.url 
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ error: 'Failed to process logo' }, { status: 500 });
  }
}
