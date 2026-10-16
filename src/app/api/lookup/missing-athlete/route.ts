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
    const {
      athleteName,
      eventName,
      teamName,
      age,
      parentName,
      parentEmail,
      parentPhone,
      notes
    } = body;

    if (!parentPhone || !parentEmail || !athleteName) {
      return NextResponse.json(
        { success: false, error: 'Please provide athlete name, parent email, and parent phone.' },
        { status: 400 }
      );
    }

    const { display: displayPhone, e164 } = cleanPhone(parentPhone);
    const id = `missing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const record = {
      id,
      name: (parentName || 'Parent').trim(),
      athleteName: (athleteName || '').trim(),
      phone: displayPhone,
      email: (parentEmail || '').trim().toLowerCase(),
      eventId: 'missing-athlete-request',
      eventName: (eventName || 'Youth Sports Picture Day').trim(),
      teamName: (teamName || '').trim(),
      age: (age || '').trim(),
      notes: (notes || '').trim(),
      createdAt,
      source: 'missing_athlete_lookup'
    };

    // Save to local opt-in database
    try {
      let existing: any[] = [];
      try {
        const raw = await fs.readFile(LOCAL_BACKUP_PATH, 'utf8');
        existing = JSON.parse(raw);
      } catch {}
      existing.unshift(record);
      await fs.writeFile(LOCAL_BACKUP_PATH, JSON.stringify(existing, null, 2), 'utf8');
    } catch (saveErr) {
      console.error('Failed to save missing athlete record:', saveErr);
    }

    // Send immediate priority email notification via Resend to Maxx
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'iHatePictureDay <info@ihatepictureday.com>',
          to: ['maxx@ihatepictureday.com'],
          subject: `🚨 Missing Athlete Request: ${record.athleteName} (${record.eventName} - ${teamName || 'No Team'})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px;">
              <h2 style="color: #E02826; text-transform: uppercase; margin-top: 0;">Missing Athlete Gallery Request</h2>
              <p>A parent could not find their athlete via player lookup and submitted their details:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px; color: #ddd; font-size: 14px;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; width: 140px; color: #888;">Athlete Name:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #fff; font-size: 16px;">${record.athleteName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Event / League:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222;">${record.eventName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Team Name:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222; color: #E02826; font-weight: bold;">${teamName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Age / Division:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222;">${age || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Parent Name:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222;">${parentName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Parent Phone:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222;"><a href="tel:${displayPhone}" style="color: #E02826; font-weight: bold;">${displayPhone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Parent Email:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222;"><a href="mailto:${record.email}" style="color: #E02826;">${record.email}</a></td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-weight: bold; color: #888;">Notes:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #222; font-style: italic;">${notes}</td>
                </tr>
                ` : ''}
              </table>
              
              <div style="margin-top: 24px; padding: 12px; background: #1a1a1a; border-left: 3px solid #E02826; font-size: 12px; color: #aaa;">
                Next step: Find this athlete in GotPhoto or your camera cards, copy their 1-click gallery link, and reply to their email or text them!
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error('Failed to send missing athlete email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Request received for ${record.athleteName}! Maxx has been notified and will locate your gallery link shortly.`,
      record
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
