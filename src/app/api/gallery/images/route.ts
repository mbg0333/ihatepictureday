import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    let prefix = 'images/samples/';
    if (category && category !== 'All') {
      prefix += `${category.toLowerCase()}/`;
    }

    const { blobs } = await list({ prefix });

    const images = blobs.map(blob => {
      // Extract category from path: images/samples/baseball/file.jpg -> baseball
      const parts = blob.pathname.split('/');
      const imgCategory = parts.length >= 3 ? parts[2] : 'General';
      
      return {
        id: blob.pathname,
        src: blob.url,
        url: blob.url,
        category: imgCategory.charAt(0).toUpperCase() + imgCategory.slice(1),
        title: blob.pathname.split('/').pop()?.split('.')[0].replace(/-/g, ' ') || 'Photo',
        alt: imgCategory,
      };
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images', images: [] }, { status: 500 });
  }
}
