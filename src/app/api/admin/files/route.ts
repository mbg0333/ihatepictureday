import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    let prefix = 'images/';
    if (type === 'event') prefix += `events/${id}/`;
    else if (type === 'sample') prefix += `samples/${id}/`;
    else if (type === 'hero') prefix += `hero/`;
    else if (type === 'bighead') prefix += `bighead/${id}/`;

    const { blobs } = await list({ prefix });
    
    const files = blobs.map(blob => ({
      name: blob.pathname.split('/').pop(),
      url: blob.url,
      path: blob.url // In Vercel Blob, the URL is the unique identifier for deletion
    }));

    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, path, newName, folderPrefix } = body;

    if (action === 'delete') {
      if (!path) {
        return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
      }
      await del(path);
      return NextResponse.json({ success: true });
    }

    if (action === 'rename') {
      if (!path || !newName || !folderPrefix) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      try {
        const response = await fetch(path);
        const fileBlob = await response.blob();
        
        const { put } = await import('@vercel/blob');
        const newBlob = await put(`${folderPrefix}${newName}`, fileBlob, {
          access: 'public',
        });
        
        await del(path);
        return NextResponse.json({ success: true, url: newBlob.url });
      } catch (error: any) {
        console.error('Rename error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Keeping this for backward compatibility if needed, but the UI now uses POST
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('path');

  if (!url) {
    return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
  }

  try {
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
