import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const samplesDir = join(process.cwd(), 'public', 'images', 'samples');
    
    if (!existsSync(samplesDir)) {
      return NextResponse.json({ images: [] });
    }

    const categories = await readdir(samplesDir);
    let allImages: any[] = [];

    for (const cat of categories) {
      const catPath = join(samplesDir, cat);
      const stat = await readdir(catPath); // Assuming it's a dir
      
      const images = stat
        .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
        .map(file => ({
          src: `/images/samples/${cat}/${file}`,
          category: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
          title: file.split('.')[0].replace(/_/g, ' ')
        }));
      
      allImages = [...allImages, ...images];
    }

    // Sort by category
    allImages.sort((a, b) => a.category.localeCompare(b.category));

    return NextResponse.json({ images: allImages });

  } catch (error: any) {
    console.error('Gallery API Error:', error);
    return NextResponse.json({ images: [] });
  }
}
