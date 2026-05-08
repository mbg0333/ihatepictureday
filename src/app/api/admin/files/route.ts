import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'event' or 'sample'
    const id = searchParams.get('id'); // galleryId or category

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    const dirPath = type === 'sample' 
      ? join(process.cwd(), 'public', 'images', 'samples', id)
      : type === 'hero'
      ? join(process.cwd(), 'public', 'images', 'hero')
      : join(process.cwd(), 'public', 'images', 'events', id);

    if (!existsSync(dirPath)) {
      return NextResponse.json({ files: [] });
    }

    const files = await readdir(dirPath);
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map(file => ({
        name: file,
        url: type === 'sample' ? `/images/samples/${id}/${file}` : type === 'hero' ? `/images/hero/${file}` : `/images/events/${id}/${file}`,
        path: type === 'sample' ? `images/samples/${id}/${file}` : type === 'hero' ? `images/hero/${file}` : `images/events/${id}/${file}`
      }));

    return NextResponse.json({ files: imageFiles });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path'); // relative path from public/

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Security check: ensure path is within images directory
    if (!filePath.startsWith('images/events/') && !filePath.startsWith('images/samples/')) {
      return NextResponse.json({ error: 'Unauthorized path' }, { status: 403 });
    }

    const absolutePath = join(process.cwd(), 'public', filePath);

    if (existsSync(absolutePath)) {
      await unlink(absolutePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
