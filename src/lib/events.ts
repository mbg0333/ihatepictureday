import { list, put } from '@vercel/blob';
import { activeGalleries } from '@/data/events';
import { GalleryEvent } from '@/data/types';
import { promises as fs } from 'fs';
import path from 'path';

const LOCAL_EVENTS_FILE = path.join(process.cwd(), 'src', 'data', 'events.json');

export async function getEvents(): Promise<GalleryEvent[]> {
  // 1. Try Vercel Blob first
  try {
    const { blobs } = await list({ prefix: 'data/events.json' });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    }
  } catch (err) {
    // Vercel blob error or offline fallback
  }

  // 2. Try local fallback file if exists
  try {
    const localContent = await fs.readFile(LOCAL_EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(localContent);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}

  // 3. Fallback to activeGalleries
  return activeGalleries;
}

export async function saveEvents(events: GalleryEvent[]): Promise<void> {
  // 1. Save to Vercel Blob
  try {
    await put('data/events.json', JSON.stringify(events, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.warn('Vercel Blob save warning:', err);
  }

  // 2. Try local backup file
  try {
    await fs.writeFile(LOCAL_EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
  } catch {}

  // 3. Try to update events.ts if in local dev
  try {
    const tsPath = path.join(process.cwd(), 'src', 'data', 'events.ts');
    const content = `import { GalleryEvent } from "./types";\n\nexport const activeGalleries: GalleryEvent[] = ${JSON.stringify(events, null, 2)};\n`;
    await fs.writeFile(tsPath, content, 'utf8');
  } catch {}
}
