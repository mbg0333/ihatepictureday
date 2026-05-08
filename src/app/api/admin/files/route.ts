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

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('path'); // We use the URL as the path for Vercel Blob del

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
