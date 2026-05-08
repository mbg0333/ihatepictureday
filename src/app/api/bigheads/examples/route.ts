import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'images/bighead/builder-examples/' });

    const examples = blobs
      .filter(blob => !blob.pathname.split('/').pop()?.startsWith('HIDDEN_'))
      .map(blob => ({
        name: blob.pathname.split('/').pop()?.split('.')[0].replace(/-/g, ' ').replace('HIDDEN_', '').toUpperCase() || 'EXAMPLE',
        url: blob.url,
      }));

    return NextResponse.json({ examples });
  } catch (error) {
    console.error('Failed to fetch bighead examples:', error);
    return NextResponse.json({ examples: [] }, { status: 500 });
  }
}
