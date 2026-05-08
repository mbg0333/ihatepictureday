import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Raw list call - exactly how Admin does it
    const { blobs } = await list({ prefix: 'images/samples/' });
    
    const images = blobs.map(blob => {
      const parts = blob.pathname.split('/');
      const imgCategory = parts.length >= 3 ? parts[2] : 'General';
      return {
        id: blob.pathname,
        src: blob.url,
        category: imgCategory.charAt(0).toUpperCase() + imgCategory.slice(1),
        title: blob.pathname.split('/').pop()?.split('.')[0] || 'Photo'
      };
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('CRITICAL GALLERY ERROR:', error);
    return NextResponse.json({ error: error.message, images: [] }, { status: 500 });
  }
}
