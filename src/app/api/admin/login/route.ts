import { NextRequest, NextResponse } from 'next/server';
import { setSession, setPendingSession, verify2FACode } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, code } = body;

    // Phase 2: Verify 2FA Code
    if (code) {
      const isValid = await verify2FACode(code);
      if (isValid) {
        await setSession();
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Invalid or expired 2FA code' }, { status: 401 });
      }
    }

    // Phase 1: Verify Password and Send 2FA Code
    if (password === process.env.ADMIN_PASSWORD) {
      const authCode = await setPendingSession();
      
      // Send the code via email
      try {
        await resend.emails.send({
          from: 'iHatePictureDay <auth@ihatepictureday.com>',
          to: ['maxx@ihatepictureday.com'], // Hardcoded as per current site logic or use ADMIN_EMAIL
          subject: `${authCode} is your iHatePictureDay Access Code`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
              <h1 style="color: #E02826; text-transform: uppercase; italic: true; margin-bottom: 24px;">Security Verification</h1>
              <p style="font-size: 16px; color: #666; margin-bottom: 32px;">Your administrative login request requires a second factor of authentication. Use the code below to finalize your access.</p>
              <div style="background: #000; color: #fff; padding: 24px; text-align: center; font-size: 40px; font-weight: 900; letter-spacing: 10px; margin-bottom: 32px;">
                ${authCode}
              </div>
              <p style="font-size: 12px; color: #999;">If you did not request this code, please change your administrative password immediately.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send 2FA email:', emailError);
        // In development, we still want to know the code if email fails
        console.log('DEV 2FA CODE:', authCode);
      }

      return NextResponse.json({ 
        success: true, 
        step: 2, 
        message: 'Verification code sent to registered email.' 
      });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const { clearSession } = await import('@/lib/auth');
  await clearSession();
  return NextResponse.json({ success: true });
}
