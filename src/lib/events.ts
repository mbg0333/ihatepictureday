import { list, put } from '@vercel/blob';
import { activeGalleries } from '@/data/events';
import { GalleryEvent } from '@/data/types';
import { promises as fs } from 'fs';
import path from 'path';

const LOCAL_EVENTS_FILE = path.join(process.cwd(), 'src', 'data', 'events.json');

// Obsolete or duplicate legacy IDs to purge
const OBSOLETE_IDS = new Set(['hyb22026', 'lp-football-2026']);

export function cleanAndDeduplicateEvents(events: GalleryEvent[]): GalleryEvent[] {
  if (!Array.isArray(events)) return [];

  // 1. Remove explicitly obsolete IDs
  const filtered = events.filter(e => e && e.id && !OBSOLETE_IDS.has(e.id));

  // 2. Deduplicate by normalized access code or ID
  const map = new Map<string, GalleryEvent>();
  for (const e of filtered) {
    const key = (e.accessCode || e.id).trim().toUpperCase();
    if (!map.has(key)) {
      map.set(key, e);
    } else {
      // If duplicate exists, keep the one with a more recent date or non-default status
      const existing = map.get(key)!;
      if (e.date && existing.date && new Date(e.date).getTime() > new Date(existing.date).getTime()) {
        map.set(key, e);
      }
    }
  }

  return Array.from(map.values());
}

export async function getEvents(): Promise<GalleryEvent[]> {
  // 1. Try Vercel Blob first
  try {
    const { blobs } = await list({ prefix: 'data/events.json' });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          const cleaned = cleanAndDeduplicateEvents(rawData);
          // If items were purged, save the clean version back to Blob in the background
          if (cleaned.length !== rawData.length) {
            saveEvents(cleaned).catch(() => {});
          }
          return cleaned;
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
      return cleanAndDeduplicateEvents(parsed);
    }
  } catch {}

  // 3. Fallback to activeGalleries
  return activeGalleries;
}

export async function saveEvents(events: GalleryEvent[]): Promise<void> {
  const cleaned = cleanAndDeduplicateEvents(events);

  // 1. Save to Vercel Blob
  try {
    await put('data/events.json', JSON.stringify(cleaned, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.warn('Vercel Blob save warning:', err);
  }

  // 2. Try local backup file
  try {
    await fs.writeFile(LOCAL_EVENTS_FILE, JSON.stringify(cleaned, null, 2), 'utf8');
  } catch {}

  // 3. Try to update events.ts if in local dev
  try {
    const tsPath = path.join(process.cwd(), 'src', 'data', 'events.ts');
    const content = `import { GalleryEvent } from "./types";\n\nexport const activeGalleries: GalleryEvent[] = ${JSON.stringify(cleaned, null, 2)};\n`;
    await fs.writeFile(tsPath, content, 'utf8');
  } catch {}
}
