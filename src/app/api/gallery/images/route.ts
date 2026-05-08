import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  try {
    // List blobs with the category prefix
    const { blobs } = await list({ 
      prefix: `images/samples/${category.toLowerCase()}/` 
    });

    const images = blobs.map(blob => ({
      id: blob.pathname,
      url: blob.url,
      alt: category,
    }));

    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
