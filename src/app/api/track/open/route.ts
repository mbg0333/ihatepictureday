import { NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_TRACKING_PATH = path.join(process.cwd(), 'src', 'data', 'email_opens.json');
const BLOB_PATH = 'data/email_opens.json';

// Standard 1x1 transparent GIF (42 bytes)
const PIXEL_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

interface OpenRecord {
  trackingId: string;
  firstOpenedAt: string;
  lastOpenedAt: string;
  openCount: number;
  userAgent?: string;
}

async function loadOpenRecords(): Promise<Record<string, OpenRecord>> {
  // 1. Try Vercel Blob
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {}

  // 2. Try local file fallback
  try {
    const raw = await fs.readFile(LOCAL_TRACKING_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveOpenRecords(records: Record<string, OpenRecord>): Promise<void> {
  const jsonStr = JSON.stringify(records, null, 2);

  // 1. Try Vercel Blob
  try {
    await put(BLOB_PATH, jsonStr, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch {}

  // 2. Try local file fallback
  try {
    await fs.writeFile(LOCAL_TRACKING_PATH, jsonStr, 'utf8');
  } catch {}
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const format = url.searchParams.get('format');

  // API query for desktop app sync
  if (format === 'json') {
    const records = await loadOpenRecords();
    return NextResponse.json({
      success: true,
      records: Object.values(records),
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

    // Async record update so GIF returns instantly
    (async () => {
      try {
        const records = await loadOpenRecords();
        if (records[cleanId]) {
          records[cleanId].openCount = (records[cleanId].openCount || 1) + 1;
          records[cleanId].lastOpenedAt = now;
          records[cleanId].userAgent = userAgent;
        } else {
          records[cleanId] = {
            trackingId: cleanId,
            firstOpenedAt: now,
            lastOpenedAt: now,
            openCount: 1,
            userAgent
          };
        }
        await saveOpenRecords(records);
      } catch (err) {
        console.error('Failed to log email open:', err);
      }
    })();
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
