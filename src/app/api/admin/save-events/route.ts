import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { events } = await req.json();
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ success: false, error: 'Invalid events data' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'events.ts');
    
    // Generate the TypeScript file content
    const content = `import { GalleryEvent } from "./types";

export const activeGalleries: GalleryEvent[] = ${JSON.stringify(events, null, 2)};
`;

    await fs.writeFile(filePath, content, 'utf8');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to save events to file:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
