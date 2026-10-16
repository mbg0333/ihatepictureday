import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { searchAthletes, AthleteRecord } from '@/lib/lookupEngine';
import { activeGalleries } from '@/data/events';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'player-lookup.json');

async function loadRosterData() {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.warn('Could not read player-lookup.json fallback, using activeGalleries default codes');
    return { events: [] };
  }
}

export async function GET() {
  const data = await loadRosterData();
  const eventList = (data.events || []).map((e: any) => ({
    id: e.id,
    name: e.name,
    athleteCount: e.athleteCount || (e.athletes ? e.athletes.length : 0),
    status: e.status || 'live'
  }));

  // Also include activeGalleries if not already in roster list
  const existingNames = new Set(eventList.map((e: any) => e.name.toLowerCase()));
  for (const g of activeGalleries) {
    if (!existingNames.has(g.name.toLowerCase())) {
      eventList.push({
        id: g.id,
        name: g.name,
        athleteCount: 0,
        status: g.status
      });
    }
  }

  return NextResponse.json({
    success: true,
    events: eventList,
    totalEvents: eventList.length
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

    // Filter by event if selected
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

    // Collect all athletes from targeted events
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

    // Perform smart fuzzy + nickname search
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
