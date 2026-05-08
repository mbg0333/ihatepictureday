import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: 'images/samples/' });
    
    // Extract unique category names from the paths
    // e.g. images/samples/football/img.jpg -> football
    const categoriesSet = new Set<string>();
    
    blobs.forEach(blob => {
      const parts = blob.pathname.split('/');
      // images (0) / samples (1) / category (2) / file (3)
      if (parts.length >= 3) {
        categoriesSet.add(parts[2]);
      }
    });

    const categories = Array.from(categoriesSet).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1)
    }));

    // Fallback if empty to ensure UI has something
    if (categories.length === 0) {
      categories.push({ id: 'football', name: 'Football' });
      categories.push({ id: 'baseball', name: 'Baseball' });
      categories.push({ id: 'softball', name: 'Softball' });
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Failed to list categories:', error);
    return NextResponse.json({ categories: [
      { id: 'football', name: 'Football' },
      { id: 'baseball', name: 'Baseball' },
      { id: 'softball', name: 'Softball' }
    ] });
  }
}
