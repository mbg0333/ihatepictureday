import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'sample';

  try {
    const { blobs } = await list({ prefix: 'images/' });
    
    const categoriesSet = new Set<string>();
    
    blobs.forEach(blob => {
      const parts = blob.pathname.split('/');
      if (type === 'event' && parts[1] === 'events' && parts[2]) {
        categoriesSet.add(parts[2]);
      } else if (type === 'sample' && parts[1] === 'samples' && parts[2]) {
        categoriesSet.add(parts[2]);
      } else if (type === 'bighead' && parts[1] === 'bighead' && parts[2]) {
        categoriesSet.add(parts[2]);
      }
    });

    let categories = Array.from(categoriesSet).map(cat => ({
      id: cat,
      name: cat === 'samples' ? 'Main Landing Samples' : cat === 'builder-examples' ? 'Builder Style Previews' : cat.charAt(0).toUpperCase() + cat.slice(1)
    }));

    // Ensure core bighead categories always exist for management
    if (type === 'bighead') {
      if (!categories.find(c => c.id === 'samples')) {
        categories.unshift({ id: 'samples', name: 'Main Landing Samples' });
      }
      if (!categories.find(c => c.id === 'builder-examples')) {
        categories.push({ id: 'builder-examples', name: 'Builder Style Previews' });
      }
    }

    // Fallback if empty to ensure UI has something useful
    if (categories.length === 0) {
      if (type === 'bighead') {
        categories.push({ id: 'samples', name: 'Main Landing Samples' });
        categories.push({ id: 'builder-examples', name: 'Builder Style Previews' });
      } else if (type === 'sample') {
        categories.push({ id: 'football', name: 'Football' });
        categories.push({ id: 'baseball', name: 'Baseball' });
        categories.push({ id: 'softball', name: 'Softball' });
      } else {
        categories.push({ id: 'general', name: 'General' });
      }
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Failed to list categories:', error);
    return NextResponse.json({ categories: type === 'bighead' ? [
      { id: 'samples', name: 'Main Landing Samples' },
      { id: 'builder-examples', name: 'Builder Style Previews' }
    ] : [
      { id: 'football', name: 'Football' },
      { id: 'baseball', name: 'Baseball' },
      { id: 'softball', name: 'Softball' }
    ] });
  }
}
