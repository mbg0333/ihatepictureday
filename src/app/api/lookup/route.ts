import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { searchAthletes, AthleteRecord } from '@/lib/lookupEngine';
import { getEvents } from '@/lib/events';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'player-lookup.json');

async function loadRosterData() {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return { events: [] };
  }
}

export async function GET() {
  const activeEvents = await getEvents();
  const rosterData = await loadRosterData();
  const rosterEvents = rosterData.events || [];

  const cleanEvents: Array<{ id: string; name: string; athleteCount: number; status: string }> = [];
  const seenNames = new Set<string>();

  // 1. Prioritize active, live website events
  for (const g of activeEvents) {
    if (g.status === 'Archive') continue;
    const norm = g.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (seenNames.has(norm)) continue;
    seenNames.add(norm);

    const rosterMatch = rosterEvents.find((r: any) => {
      const rNorm = (r.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      return rNorm === norm || String(r.id) === String(g.id);
    });

    cleanEvents.push({
      id: g.id,
      name: g.name,
      athleteCount: rosterMatch?.athleteCount || (rosterMatch?.athletes ? rosterMatch.athletes.length : 0),
      status: g.status
    });
  }

  // 2. Add published jobs that have real athletes and are not test jobs
  for (const r of rosterEvents) {
    const athletesCount = r.athleteCount || (r.athletes ? r.athletes.length : 0);
    if (athletesCount === 0) continue;
    const rName = (r.name || '').trim();
    if (rName.toLowerCase().includes('test')) continue;

    const norm = rName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      cleanEvents.push({
        id: String(r.id),
        name: rName,
        athleteCount: athletesCount,
        status: r.status || 'live'
      });
    }
  }

  return NextResponse.json({
    success: true,
    events: cleanEvents,
    totalEvents: cleanEvents.length
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, eventName, firstName, lastName } = body;

    const queryFirst = (firstName || '').trim();
    const queryLast = (lastName || '').trim();

    if (!queryFirst && !queryLast) {
      return NextResponse.json(
        { success: false, error: 'Please enter at least a First Name or Last Name to search.' },
        { status: 400 }
      );
    }

    const data = await loadRosterData();
    let candidateAthletes: AthleteRecord[] = [];

    const events = data.events || [];
    let targetEvents = events;

    if (eventId && eventId !== 'all') {
      const match = events.find((e: any) => 
        String(e.id) === String(eventId) || 
        e.name.toLowerCase() === eventId.toLowerCase()
      );
      if (match) {
        targetEvents = [match];
      }
    } else if (eventName && eventName !== 'all') {
      const match = events.find((e: any) => 
        e.name.toLowerCase().includes(eventName.toLowerCase()) || 
        eventName.toLowerCase().includes(e.name.toLowerCase())
      );
      if (match) {
        targetEvents = [match];
      }
    }

    for (const evt of targetEvents) {
      if (evt.athletes && Array.isArray(evt.athletes)) {
        for (const a of evt.athletes) {
          candidateAthletes.push({
            ...a,
            eventId: evt.id,
            eventName: evt.name,
            galleryUrl: a.galleryUrl || (a.accessCode ? `https://orders.ihatepictureday.com/login?access_code=${a.accessCode}` : '')
          });
        }
      }
    }

    const matches = searchAthletes(candidateAthletes, queryFirst, queryLast, 0.70);

    return NextResponse.json({
      success: true,
      count: matches.length,
      matches,
      query: { eventId, eventName, firstName: queryFirst, lastName: queryLast }
    });
  } catch (err: any) {
    console.error('Player lookup error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
