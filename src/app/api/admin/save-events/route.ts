import { NextResponse } from 'next/server';
import { saveEvents } from '@/lib/events';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { events } = await req.json();
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ success: false, error: 'Invalid events data' }, { status: 400 });
    }

    await saveEvents(events);

    return NextResponse.json({ success: true, count: events.length });
  } catch (err: any) {
    console.error('Failed to save events:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
