import { NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';
import { Resend } from 'resend';
import { OptInRegistration } from '@/data/types';
import { promises as fs } from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_for_build");
const LOCAL_BACKUP_PATH = path.join(process.cwd(), 'src', 'data', 'opt-ins-local.json');

// Helper to normalize phone number to standard 10-digit / E.164
function cleanPhone(raw: string): { display: string; e164: string } {
  const digits = raw.replace(/\D/g, '');
  const tenDigits = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (tenDigits.length !== 10) {
    return { display: raw, e164: raw };
  }
  const display = `(${tenDigits.slice(0, 3)}) ${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`;
  const e164 = `+1${tenDigits}`;
  return { display, e164 };
}

// Read local fallback file
async function readLocalRegistrations(): Promise<OptInRegistration[]> {
  try {
    const data = await fs.readFile(LOCAL_BACKUP_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write local fallback file
async function saveLocalRegistrations(items: OptInRegistration[]): Promise<void> {
  try {
    await fs.writeFile(LOCAL_BACKUP_PATH, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write local registrations backup:', err);
  }
}

// Load all registrations (from Vercel Blob, with local fallback)
async function getAllRegistrations(): Promise<OptInRegistration[]> {
  const registrations: OptInRegistration[] = [];

  // Try Vercel Blob first
  try {
    const { blobs } = await list({ prefix: 'data/optins/' });
    if (blobs.length > 0) {
      const fetchPromises = blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: 'no-store' });
          if (res.ok) {
            const data: OptInRegistration = await res.json();
            return data;
          }
        } catch (e) {
          console.error(`Failed to fetch registration blob ${blob.url}:`, e);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      for (const item of results) {
        if (item) registrations.push(item);
      }
    }
  } catch (blobErr) {
    // Blob not configured or in local dev without token
  }

  // Also include local items (for dev and offline backups, deduplicated by id)
  const localItems = await readLocalRegistrations();
  const existingIds = new Set(registrations.map(r => r.id));
  for (const item of localItems) {
    if (!existingIds.has(item.id)) {
      registrations.push(item);
    }
  }

  // Sort newest first
  return registrations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const eventFilter = searchParams.get('event');

  try {
    let registrations = await getAllRegistrations();

    if (eventFilter && eventFilter !== 'all') {
      registrations = registrations.filter(r => r.eventId === eventFilter || r.eventName === eventFilter);
    }

    // Format for IHPD Text Campaigns & PhotoDay Importer
    if (format === 'csv') {
      const csvRows: string[] = [];
      // Columns designed specifically to align with IHPD Text Campaigns importer.py
      csvRows.push(['first_name', 'last_name', 'phone', 'email', 'student_name', 'job_name', 'created_at'].join(','));

      for (const r of registrations) {
        const nameParts = (r.name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const athlete = r.athleteName || '';
        const event = r.eventName || '';
        const phone = r.phone || '';
        const email = r.email || '';
        const created = r.createdAt || '';

        // Escape CSV values
        const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

        csvRows.push([
          escapeCsv(firstName),
          escapeCsv(lastName),
          escapeCsv(phone),
          escapeCsv(email),
          escapeCsv(athlete),
          escapeCsv(event),
          escapeCsv(created),
        ].join(','));
      }

      return new Response(csvRows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="ihpd-optins-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, athleteName, phone, email, eventId, eventName } = body;

    if (!name || !phone || !email || !eventName) {
      return NextResponse.json(
        { success: false, error: 'Please provide your Name, Cell Phone, Email, and select an Event.' },
        { status: 400 }
      );
    }

    const { display: displayPhone, e164 } = cleanPhone(phone);
    const id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const registration: OptInRegistration = {
      id,
      name: name.trim(),
      athleteName: (athleteName || '').trim(),
      phone: displayPhone,
      email: email.trim().toLowerCase(),
      eventId: (eventId || 'general').trim(),
      eventName: eventName.trim(),
      createdAt,
      source: 'web_opt_in',
    };

    // 1. Try to save to Vercel Blob
    let savedToBlob = false;
    try {
      await put(`data/optins/${id}.json`, JSON.stringify(registration), {
        access: 'public',
        addRandomSuffix: false,
      });
      savedToBlob = true;
    } catch (blobErr) {
      // Blob write failed or local dev
    }

    // 2. Always persist to local storage backup
    const localItems = await readLocalRegistrations();
    localItems.unshift(registration);
    await saveLocalRegistrations(localItems);

    // 3. Send email notification via Resend to admin (fire and forget / non-blocking)
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'iHatePictureDay <info@ihatepictureday.com>',
          to: ['maxx@ihatepictureday.com'],
          subject: `📸 New Picture Day Registration: ${registration.name} (${registration.eventName})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px;">
              <h2 style="color: #E02826; text-transform: uppercase; margin-top: 0;">New Picture Day Registration</h2>
              <p style="color: #aaa; font-size: 14px;">A parent/athlete just opted in to receive SMS gallery alerts and launch updates.</p>
              
              <div style="background: #1c1c1c; padding: 16px; border-left: 4px solid #E02826; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 6px 0;"><strong>Parent/Contact:</strong> ${registration.name}</p>
                ${registration.athleteName ? `<p style="margin: 6px 0;"><strong>Athlete:</strong> ${registration.athleteName}</p>` : ''}
                <p style="margin: 6px 0;"><strong>Event:</strong> <span style="color: #E02826; font-weight: bold;">${registration.eventName}</span></p>
                <p style="margin: 6px 0;"><strong>Cell Phone:</strong> <a href="tel:${e164}" style="color: #fff;">${registration.phone}</a></p>
                <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${registration.email}" style="color: #fff;">${registration.email}</a></p>
                <p style="margin: 6px 0; font-size: 12px; color: #777;">Registered At: ${new Date(createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
              </div>

              <p style="font-size: 12px; color: #666;">This contact is ready to sync directly into your IHPD Text Campaigns dashboard.</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Failed to send registration notification email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "You're registered! We'll text you when galleries go live.",
      registration,
      savedToBlob,
    });
  } catch (error: any) {
    console.error('Error in opt-in handler:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Registration ID is required' }, { status: 400 });
    }

    // Delete from Blob if exists
    try {
      await del(`data/optins/${id}.json`);
    } catch (e) {}

    // Delete from local file
    const localItems = await readLocalRegistrations();
    const updated = localItems.filter(r => r.id !== id);
    await saveLocalRegistrations(updated);

    return NextResponse.json({ success: true, message: 'Registration deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
