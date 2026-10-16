import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { promises as fs } from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_for_build");
const LOCAL_BACKUP_PATH = path.join(process.cwd(), 'src', 'data', 'opt-ins-local.json');

function cleanPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  const tenDigits = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (tenDigits.length !== 10) return { display: raw, e164: raw };
  return {
    display: `(${tenDigits.slice(0, 3)}) ${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`,
    e164: `+1${tenDigits}`
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, athleteName, accessCode, galleryUrl, eventName } = body;

    if (!phone || !accessCode) {
      return NextResponse.json({ success: false, error: 'Phone and access code are required.' }, { status: 400 });
    }

    const { display: displayPhone, e164 } = cleanPhone(phone);
    const id = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const record = {
      id,
      name: (name || 'Parent').trim(),
      athleteName: (athleteName || '').trim(),
      phone: displayPhone,
      email: (email || '').trim().toLowerCase(),
      eventId: 'player-lookup',
      eventName: eventName || 'Player Lookup Claim',
      accessCode,
      galleryUrl,
      createdAt,
      source: 'player_lookup_claim'
    };

    // Save to local opt-in store
    try {
      let existing: any[] = [];
      try {
        const raw = await fs.readFile(LOCAL_BACKUP_PATH, 'utf8');
        existing = JSON.parse(raw);
      } catch {}
      existing.unshift(record);
      await fs.writeFile(LOCAL_BACKUP_PATH, JSON.stringify(existing, null, 2), 'utf8');
    } catch (saveErr) {
      console.error('Failed to save claim:', saveErr);
    }

    // Fire email notification to admin via Resend
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'iHatePictureDay <info@ihatepictureday.com>',
          to: ['maxx@ihatepictureday.com'],
          subject: `📸 Gallery Code Claimed: ${athleteName || 'Athlete'} (${accessCode})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px;">
              <h2 style="color: #E02826; text-transform: uppercase;">Gallery Code Claimed via Player Lookup</h2>
              <p>A parent just found their athlete's gallery and requested text delivery:</p>
              <ul style="line-height: 1.8;">
                <li><strong>Athlete:</strong> ${athleteName || 'N/A'}</li>
                <li><strong>Event:</strong> ${eventName || 'N/A'}</li>
                <li><strong>Access Code:</strong> <span style="background: #222; padding: 3px 8px; font-family: monospace; color: #ff5555;">${accessCode}</span></li>
                <li><strong>Parent Name:</strong> ${name || 'N/A'}</li>
                <li><strong>Phone:</strong> ${displayPhone}</li>
                <li><strong>Email:</strong> ${email || 'N/A'}</li>
                <li><strong>Direct Link:</strong> <a href="${galleryUrl}" style="color: #E02826;">${galleryUrl}</a></li>
              </ul>
            </div>
          `
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Direct gallery link claimed for ${athleteName || 'your athlete'}!`,
      record
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
