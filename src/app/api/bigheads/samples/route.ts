import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds for performance

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'images/bighead/samples/' });

    const samples = blobs
      .filter(blob => {
        const fileName = blob.pathname.split('/').pop() || '';
        return !fileName.startsWith('HIDDEN_');
      })
      .map((blob, index) => ({
        id: index + 1,
        title: blob.pathname.split('/').pop()?.split('.')[0].replace(/-/g, ' ') || 'Big Head Sample',
        image: blob.url,
      }));

    // Fallback images if no samples exist yet
    if (samples.length === 0) {
      return NextResponse.json({ 
        samples: [
          { id: 1, title: "Standard Big Head", image: "/images/bigheads/sample1.png" },
          { id: 2, title: "Head Only Cutout", image: "/images/bigheads/sample2.png" },
          { id: 3, title: "Half Body Style", image: "/images/bigheads/sample1.png" },
          { id: 4, title: "Half Body w/ Name", image: "/images/bigheads/sample2.png" },
        ] 
      });
    }

    return NextResponse.json({ samples });
  } catch (error) {
    console.error('Failed to fetch bighead samples:', error);
    return NextResponse.json({ samples: [] }, { status: 500 });
  }
}
