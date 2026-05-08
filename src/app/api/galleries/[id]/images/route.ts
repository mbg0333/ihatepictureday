import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'events', id);

  try {
    if (!fs.existsSync(galleryDir)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(galleryDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map(file => `/images/events/${id}/${encodeURIComponent(file)}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading gallery directory:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
