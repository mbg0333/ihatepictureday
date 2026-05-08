import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { blobs } = await list({ 
      prefix: `images/events/${id}/` 
    });

    const images = blobs.map(blob => ({
      id: blob.pathname,
      url: blob.url,
      alt: `Event image ${id}`,
    }));

    return NextResponse.json(images);
  } catch (error: any) {
    console.error(`Error fetching images for event ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
