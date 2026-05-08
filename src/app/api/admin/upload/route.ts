import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const type = (formData.get('type') as string) || 'event'; // 'event', 'sample', or 'hero'
    const galleryId = formData.get('galleryId') as string;
    const category = formData.get('category') as string;
    const files = formData.getAll('files') as File[];

    if (!galleryId && type === 'event') {
      return NextResponse.json({ error: 'Gallery ID is required for events' }, { status: 400 });
    }

    if (!category && type === 'sample') {
      return NextResponse.json({ error: 'Category is required for samples' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Define target directory
    let uploadDir;
    if (type === 'sample') {
      uploadDir = join(process.cwd(), 'public', 'images', 'samples', category);
    } else if (type === 'hero') {
      uploadDir = join(process.cwd(), 'public', 'images', 'hero');
    } else {
      uploadDir = join(process.cwd(), 'public', 'images', 'events', galleryId);
    }

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize filename
      const cleanName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const filePath = join(uploadDir, cleanName);

      await writeFile(filePath, buffer);
      
      let baseUrl;
      if (type === 'sample') baseUrl = `/images/samples/${category}`;
      else if (type === 'hero') baseUrl = `/images/hero`;
      else baseUrl = `/images/events/${galleryId}`;

      savedFiles.push({
        name: cleanName,
        url: `${baseUrl}/${cleanName}`
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${savedFiles.length} files uploaded to ${type}`,
      files: savedFiles 
    });

  } catch (error: any) {
    console.error('Admin Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload files' }, { status: 500 });
  }
}
