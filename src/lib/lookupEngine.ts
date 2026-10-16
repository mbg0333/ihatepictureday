// Smart Player Lookup Engine with Text Normalization, Nickname Matching, and Fuzzy Distance

export interface AthleteRecord {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  studentName?: string;
  groupName?: string;
  identifier?: string;
  accessCode: string;
  galleryUrl?: string;
  jobId?: string | number;
  jobName?: string;
  eventId?: string;
  eventName?: string;
}

export interface LookupMatch extends AthleteRecord {
  score: number;
  confidence: "Exact Match" | "High Confidence" | "Likely Match";
  matchReason: string;
}

// Comprehensive bidirectional nickname mapping dictionary
const NICKNAMES: Record<string, string[]> = {
  alexander: ["alex", "alec", "xander", "sasha"],
  alexandra: ["alex", "alexa", "lexi", "sasha", "allie"],
  alexis: ["alex", "lexi"],
  andrew: ["andy", "drew"],
  anthony: ["tony"],
  abigail: ["abby", "gail"],
  benjamin: ["ben", "benny", "benji"],
  cameron: ["cam"],
  charles: ["charlie", "chuck", "chas"],
  christopher: ["chris", "topher"],
  christian: ["chris"],
  christina: ["chris", "tina", "christie"],
  daniel: ["dan", "danny"],
  david: ["dave", "davy"],
  edward: ["ed", "eddie", "ted", "teddy", "ned"],
  elijah: ["eli"],
  elizabeth: ["liz", "lizzie", "beth", "betty", "eliza", "ellie"],
  emily: ["em", "emmy", "emma"],
  emma: ["em", "emmy"],
  evelyn: ["evie", "eve"],
  gabriel: ["gabe"],
  gabrielle: ["gabby", "brie"],
  gregory: ["greg"],
  isabella: ["bella", "izzy", "ellie"],
  jacob: ["jake"],
  james: ["jim", "jimmy", "jamie"],
  jennifer: ["jen", "jenny"],
  john: ["jack", "johnny"],
  jonathan: ["jon", "johnny"],
  joseph: ["joe", "joey"],
  joshua: ["josh"],
  katherine: ["kate", "katie", "kat", "kathy", "kay"],
  kathryn: ["kate", "katie", "kat", "kathy"],
  kaitlyn: ["kate", "katie"],
  leonard: ["leo", "lenny"],
  lucas: ["luke"],
  madeline: ["maddie", "maddy"],
  madison: ["maddie", "maddy"],
  margaret: ["meg", "megan", "maggie", "peggy"],
  matthew: ["matt", "matty"],
  maximilian: ["max"],
  maxwell: ["max"],
  michael: ["mike", "mikey"],
  nathan: ["nate"],
  nathaniel: ["nate"],
  nicholas: ["nick", "nicky", "nico"],
  oliver: ["ollie"],
  patrick: ["pat", "patty"],
  patricia: ["pat", "patty", "tricia"],
  rebecca: ["becky", "becca"],
  richard: ["rick", "ricky", "rich", "dick"],
  robert: ["rob", "robby", "bob", "bobby"],
  samuel: ["sam", "sammy"],
  samantha: ["sam", "sammy"],
  stephen: ["steve", "stevie"],
  steven: ["steve", "stevie"],
  theodore: ["ted", "teddy", "theo"],
  thomas: ["tom", "tommy"],
  timothy: ["tim", "timmy"],
  william: ["will", "willy", "bill", "billy", "liam"],
  zachary: ["zach", "zack", "zac"]
};

const REVERSE_NICKNAMES: Record<string, string[]> = {};
for (const [formal, nicks] of Object.entries(NICKNAMES)) {
  for (const nick of nicks) {
    if (!REVERSE_NICKNAMES[nick]) REVERSE_NICKNAMES[nick] = [];
    REVERSE_NICKNAMES[nick].push(formal);
  }
}

export function cleanName(val: string): string {
  if (!val) return "";
  let s = val.toLowerCase().trim();
  s = s.replace(/['`]/g, "");
  s = s.replace(/[-_]/g, " ");
  s = s.replace(/[^a-z0-9\s]/g, "");
  return s.split(/\s+/).filter(Boolean).join(" ");
}

export function getNameVariants(name: string): Set<string> {
  const n = cleanName(name);
  if (!n) return new Set();
  const variants = new Set<string>([n]);
  if (NICKNAMES[n]) {
    for (const nick of NICKNAMES[n]) variants.add(nick);
  }
  if (REVERSE_NICKNAMES[n]) {
    for (const formal of REVERSE_NICKNAMES[n]) variants.add(formal);
  }
  return variants;
}

export function levenshteinSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    costs[i] = i;
  }

  for (let j = 1; j <= shorter.length; j++) {
    let lastValue = j;
    for (let i = 1; i <= longer.length; i++) {
      let cost = 1;
      if (longer.charAt(i - 1) === shorter.charAt(j - 1)) {
        cost = 0;
      }
      const newValue = Math.min(
        costs[i] + 1,
        lastValue + 1,
        costs[i - 1] + cost
      );
      costs[i - 1] = lastValue;
      lastValue = newValue;
    }
    costs[longer.length] = lastValue;
  }

  const distance = costs[longer.length];
  return (longer.length - distance) / longer.length;
}

export function matchFirstNames(query: string, candidate: string): { score: number; reason: string } {
  const q = cleanName(query);
  const c = cleanName(candidate);
  if (!q || !c) return { score: 0, reason: "Missing first name" };

  if (q === c) return { score: 1.0, reason: "Exact first name" };

  const qVars = getNameVariants(q);
  const cVars = getNameVariants(c);
  for (const v of qVars) {
    if (cVars.has(v)) {
      return { score: 0.95, reason: `Nickname match (${query} ↔ ${candidate})` };
    }
  }

  if ((q.length >= 3 && c.startsWith(q)) || (c.length >= 3 && q.startsWith(c))) {
    const ratio = Math.min(q.length, c.length) / Math.max(q.length, c.length);
    if (ratio >= 0.6) {
      return { score: 0.90, reason: `Prefix match (${query} ↔ ${candidate})` };
    }
  }

  const sim = levenshteinSimilarity(q, c);
  if (sim >= 0.75) {
    return { score: sim, reason: `Spelling similarity (${Math.round(sim * 100)}%)` };
  }

  return { score: sim, reason: "Low similarity" };
}

export function matchLastNames(query: string, candidate: string): { score: number; reason: string } {
  const q = cleanName(query);
  const c = cleanName(candidate);
  if (!q || !c) return { score: 0, reason: "Missing last name" };

  if (q === c) return { score: 1.0, reason: "Exact last name" };

  const qTokens = new Set(q.split(" "));
  const cTokens = new Set(c.split(" "));
  const isSubset =
    Array.from(qTokens).every((t) => cTokens.has(t)) ||
    Array.from(cTokens).every((t) => qTokens.has(t));
  if (isSubset) {
    return { score: 0.95, reason: `Compound last name match (${query} ↔ ${candidate})` };
  }

  const sim = levenshteinSimilarity(q, c);
  if (sim >= 0.75) {
    return { score: sim, reason: `Spelling similarity (${Math.round(sim * 100)}%)` };
  }

  return { score: sim, reason: "Low similarity" };
}

export function scoreAthleteMatch(
  queryFirst: string,
  queryLast: string,
  candFirst: string,
  candLast: string,
  candFull: string = ""
): { score: number; reason: string } {
  if (!candFirst && !candLast && candFull) {
    const parts = candFull.trim().split(" ");
    candFirst = parts[0] || "";
    candLast = parts.slice(1).join(" ") || "";
  }

  const qF = cleanName(queryFirst);
  const qL = cleanName(queryLast);

  if (qF && qL && candFirst && candLast) {
    const fMatch = matchFirstNames(qF, candFirst);
    const lMatch = matchLastNames(qL, candLast);

    if (fMatch.score === 1.0 && lMatch.score === 1.0) {
      return { score: 1.0, reason: "Exact full name match" };
    }

    if (fMatch.score >= 0.75 && lMatch.score >= 0.75) {
      const comp = Number((0.55 * lMatch.score + 0.45 * fMatch.score).toFixed(2));
      return { score: comp, reason: `${fMatch.reason}, ${lMatch.reason}` };
    }

    if (lMatch.score >= 0.88 && fMatch.score >= 0.60) {
      const comp = Number((0.65 * lMatch.score + 0.35 * fMatch.score).toFixed(2));
      return { score: comp, reason: `${lMatch.reason}, ${fMatch.reason}` };
    }
  }

  const qFull = `${qF} ${qL}`.trim();
  const cFull = cleanName(candFull || `${candFirst} ${candLast}`);
  if (qFull && cFull) {
    if (qFull === cFull) return { score: 1.0, reason: "Exact full name match" };
    const fullSim = levenshteinSimilarity(qFull, cFull);
    if (fullSim >= 0.78) {
      return { score: Number(fullSim.toFixed(2)), reason: `Full name similarity (${Math.round(fullSim * 100)}%)` };
    }
  }

  return { score: 0, reason: "No match" };
}

export function searchAthletes(
  athletes: AthleteRecord[],
  queryFirst: string,
  queryLast: string,
  threshold: number = 0.72
): LookupMatch[] {
  const matches: LookupMatch[] = [];

  for (const a of athletes) {
    const candFirst = a.firstName || "";
    const candLast = a.lastName || "";
    const candFull = a.studentName || `${candFirst} ${candLast}`.trim();

    const { score, reason } = scoreAthleteMatch(queryFirst, queryLast, candFirst, candLast, candFull);

    if (score >= threshold) {
      const confidence =
        score >= 0.98 ? "Exact Match" : score >= 0.88 ? "High Confidence" : "Likely Match";

      matches.push({
        ...a,
        score,
        confidence,
        matchReason: reason,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}
