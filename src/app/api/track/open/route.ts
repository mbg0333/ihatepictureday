import { NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_TRACKING_PATH = path.join(process.cwd(), 'src', 'data', 'email_opens.json');
const BLOB_PREFIX = 'data/email_opens/';

// Standard 1x1 transparent GIF (42 bytes)
const PIXEL_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

// In-memory cache to debounce Apple Mail Privacy Protection and duplicate pixel pings
const memoryCache = new Map<string, OpenRecord>();
const lastSaveTimestamp = new Map<string, number>();
const SAVE_COOLDOWN_MS = 60000; // Only write to Blob once per 60 seconds per tracking ID


export interface OpenRecord {
  trackingId: string;
  firstOpenedAt: string;
  lastOpenedAt: string;
  openCount: number;
  userAgent?: string;
}

async function getOpenRecord(cleanId: string): Promise<OpenRecord | null> {
  // Check in-memory cache first to avoid Blob list operations
  if (memoryCache.has(cleanId)) {
    return memoryCache.get(cleanId)!;
  }
  // 1. Try Vercel Blob
  try {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${cleanId}.json` });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        return (await res.json()) as OpenRecord;
      }
    }
  } catch {}

  // 2. Try local file fallback
  try {
    const raw = await fs.readFile(LOCAL_TRACKING_PATH, 'utf8');
    const records: Record<string, OpenRecord> = JSON.parse(raw);
    return records[cleanId] || null;
  } catch {
    return null;
  }
}

async function saveOpenRecord(record: OpenRecord): Promise<void> {
  // Update in-memory cache immediately
  memoryCache.set(record.trackingId, record);

  // Debounce writes: skip Vercel Blob if written in the last 60 seconds
  const now = Date.now();
  const lastSaved = lastSaveTimestamp.get(record.trackingId) || 0;
  if (now - lastSaved < SAVE_COOLDOWN_MS) {
    return;
  }
  lastSaveTimestamp.set(record.trackingId, now);

  // 1. Try Vercel Blob
  try {
    await put(`${BLOB_PREFIX}${record.trackingId}.json`, JSON.stringify(record, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch (err) {
    console.error('Blob put error:', err);
  }

  // 2. Local file fallback
  try {
    let records: Record<string, OpenRecord> = {};
    try {
      const raw = await fs.readFile(LOCAL_TRACKING_PATH, 'utf8');
      records = JSON.parse(raw);
    } catch {}
    records[record.trackingId] = record;
    await fs.writeFile(LOCAL_TRACKING_PATH, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('Local file write error:', err);
  }
}

async function loadAllOpenRecords(): Promise<OpenRecord[]> {
  const records: OpenRecord[] = [];

  // 1. Try Vercel Blob list
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length > 0) {
      const fetchPromises = blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: 'no-store' });
          if (res.ok) {
            return (await res.json()) as OpenRecord;
          }
        } catch {}
        return null;
      });
      const items = await Promise.all(fetchPromises);
      for (const item of items) {
        if (item) records.push(item);
      }
    }
  } catch {}

  // 2. Merge local file
  try {
    const raw = await fs.readFile(LOCAL_TRACKING_PATH, 'utf8');
    const localMap: Record<string, OpenRecord> = JSON.parse(raw);
    const localExisting = new Set(records.map(r => r.trackingId));
    for (const item of Object.values(localMap)) {
      if (!localExisting.has(item.trackingId)) {
        records.push(item);
      }
    }
  } catch {}

  const finalExisting = new Set(records.map(r => r.trackingId));
  for (const item of memoryCache.values()) {
    if (!finalExisting.has(item.trackingId)) {
      records.push(item);
    }
  }

  return records;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const format = url.searchParams.get('format');

  // API query for desktop app sync
  if (format === 'json') {
    const records = await loadAllOpenRecords();
    return NextResponse.json({
      success: true,
      records,
      updatedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  // Tracking pixel hit
  if (id && id.trim()) {
    const cleanId = id.trim();
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const now = new Date().toISOString();

    try {
      const existing = await getOpenRecord(cleanId);
      const updated: OpenRecord = existing
        ? {
            ...existing,
            openCount: (existing.openCount || 1) + 1,
            lastOpenedAt: now,
            userAgent,
          }
        : {
            trackingId: cleanId,
            firstOpenedAt: now,
            lastOpenedAt: now,
            openCount: 1,
            userAgent,
          };
      await saveOpenRecord(updated);
    } catch (err) {
      console.error('Error logging email open:', err);
    }
  }

  // Return transparent GIF
  return new Response(PIXEL_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL_GIF.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}