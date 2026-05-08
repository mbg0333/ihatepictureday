import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const files = formData.getAll('files') as File[];
    
    let pathPrefix = '';
    if (type === 'event') {
      const galleryId = formData.get('galleryId') as string;
      pathPrefix = `events/${galleryId}`;
    } else if (type === 'sample') {
      const category = formData.get('category') as string;
      pathPrefix = `samples/${category}`;
    } else if (type === 'hero') {
      pathPrefix = `hero`;
    }

    const uploadedFiles = [];

    for (const file of files) {
      const blob = await put(`images/${pathPrefix}/${file.name}`, file, {
        access: 'public',
        addRandomSuffix: false, // Keep filenames clean for our explorer
      });
      uploadedFiles.push(blob);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded ${files.length} images to ${pathPrefix}`,
      files: uploadedFiles
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
