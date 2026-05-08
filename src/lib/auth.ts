import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'ihpd_admin_session';
const PENDING_SESSION_COOKIE = 'ihpd_admin_pending';

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!session) return false;
  return session.value === process.env.ADMIN_SESSION_SECRET;
}

export async function setPendingSession() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const cookieStore = await cookies();
  
  // Store the code in a short-lived cookie for verification
  cookieStore.set(PENDING_SESSION_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });
  
  return code;
}

export async function verify2FACode(code: string) {
  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_SESSION_COOKIE);
  
  if (!pending || pending.value !== code) return false;
  
  cookieStore.delete(PENDING_SESSION_COOKIE);
  return true;
}

export async function setSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, process.env.ADMIN_SESSION_SECRET || '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(PENDING_SESSION_COOKIE);
}
