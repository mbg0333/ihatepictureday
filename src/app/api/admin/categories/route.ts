import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const samplesDir = join(process.cwd(), 'public', 'images', 'samples');
    
    if (!existsSync(samplesDir)) {
      return NextResponse.json({ categories: [] });
    }

    const entries = await readdir(samplesDir, { withFileTypes: true });
    const categories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        id: entry.name,
        name: entry.name.charAt(0).toUpperCase() + entry.name.slice(1).replace('-', ' ')
      }));

    return NextResponse.json({ categories });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
