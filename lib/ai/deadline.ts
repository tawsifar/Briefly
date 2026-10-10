// Single source of truth for spotting a client's time expression (BUG-01/04).
// Every alternative is word-bounded so "maybe" is never read as the month "May".

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const MONTH = `(${MONTHS.join("|")})`;
const MONTH_NO_MAY = `(${MONTHS.filter((m) => m !== "may").join("|")})`;
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const PRE = "(?:(?:before|by|until|till|around|about|in|on|for|during|early|late|no later than)\\s+)?";
const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12,
};
const DAY_MS = 86_400_000;

export interface DeadlineMatch {
  wording: string;
  start: string | null; // ISO yyyy-mm-dd
  end: string | null;
}

type Resolver = (m: RegExpMatchArray, created: Date) => [Date, Date] | null;

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthIdx = (name: string) => MONTHS.indexOf(name.toLowerCase());
// A month already past at message time means next year.
const yearFor = (m: number, created: Date) =>
  m < created.getUTCMonth() ? created.getUTCFullYear() + 1 : created.getUTCFullYear();

function monthPart(part: string, m: number, created: Date): [Date, Date] {
  const y = yearFor(m, created);
  const p = part.toLowerCase();
  if (p === "beginning" || p === "start" || p === "early") return [utc(y, m, 1), utc(y, m, 10)];
  if (p === "end" || p === "late") return [utc(y, m, 21), utc(y, m, lastDay(y, m))];
  return [utc(y, m, 11), utc(y, m, 20)]; // middle / mid
}

const PATTERNS: Array<[RegExp, Resolver]> = [
  // "before the middle of October", "end of May", "early November"
  [
    new RegExp(`\\b${PRE}(?:the\\s+)?(beginning|start|middle|end)\\s+of\\s+(?:the\\s+month\\s+of\\s+)?${MONTH}\\b`, "i"),
    (m, c) => monthPart(m[1], monthIdx(m[2]), c),
  ],
  [
    new RegExp(`\\b${PRE}(?:the\\s+)?(mid|early|late)[-\\s]${MONTH}\\b`, "i"),
    (m, c) => monthPart(m[1], monthIdx(m[2]), c),
  ],
  // "October 31st", "31st of October"
  [
    new RegExp(`\\b${PRE}${MONTH}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, "i"),
    (m, c) => {
      const mi = monthIdx(m[1]);
      const d = utc(yearFor(mi, c), mi, Number(m[2]));
      return [d, d];
    },
  ],
  [
    new RegExp(`\\b${PRE}(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH}\\b`, "i"),
    (m, c) => {
      const mi = monthIdx(m[2]);
      const d = utc(yearFor(mi, c), mi, Number(m[1]));
      return [d, d];
    },
  ],
  // "first week of next month"
  [
    /\b(?:by\s+|before\s+|in\s+)?(?:the\s+)?(first|second|last)\s+week\s+of\s+next\s+month\b/i,
    (m, c) => {
      const y = c.getUTCFullYear();
      const mo = c.getUTCMonth() + 1;
      const w = m[1].toLowerCase();
      if (w === "last") return [utc(y, mo, lastDay(y, mo) - 6), utc(y, mo, lastDay(y, mo))];
      const startDay = w === "first" ? 1 : 8;
      return [utc(y, mo, startDay), utc(y, mo, startDay + 6)];
    },
  ],
  // Month names alone. "may" only after a date preposition ("in May", "by May").
  [
    new RegExp(`\\b(?:(?:before|by|until|till|in|during|around|early|late)\\s+)?${MONTH_NO_MAY}\\b`, "i"),
    (m, c) => {
      const mi = monthIdx(m[1]);
      const y = yearFor(mi, c);
      return [utc(y, mi, 1), utc(y, mi, lastDay(y, mi))];
    },
  ],
  [
    /\b(?:before|by|until|till|in|during)\s+(may)\b(?!\s+(?:i|we|you|be|have|need|want|not)\b)/i,
    (_m, c) => {
      const y = yearFor(4, c);
      return [utc(y, 4, 1), utc(y, 4, 31)];
    },
  ],
  // "in 3 weeks", "within two months"
  [
    /\b(?:with)?in\s+(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s+(day|week|month)s?\b/i,
    (m, c) => {
      const n = NUMBER_WORDS[m[1].toLowerCase()] ?? Number(m[1]);
      const unit = m[2].toLowerCase();
      const end =
        unit === "month"
          ? utc(c.getUTCFullYear(), c.getUTCMonth() + n, c.getUTCDate())
          : new Date(c.getTime() + n * (unit === "week" ? 7 : 1) * DAY_MS);
      return [end, end];
    },
  ],
  // "next month", "by next week", "end of next month"
  [
    /\b(?:(?:before|by|until|in)\s+)?(?:the\s+)?(?:(end|middle|beginning)\s+of\s+)?(?:the\s+)?(next|this)\s+(week|month|quarter|year)\b/i,
    (m, c) => {
      const y = c.getUTCFullYear();
      const unit = m[3].toLowerCase();
      const offset = m[2].toLowerCase() === "next" ? 1 : 0;
      if (unit === "month") {
        const mo = c.getUTCMonth() + offset;
        const yy = y + Math.floor(mo / 12);
        const mm = mo % 12;
        return m[1] ? monthPart(m[1], mm, utc(yy, mm, 1)) : [utc(yy, mm, 1), utc(yy, mm, lastDay(yy, mm))];
      }
      if (unit === "week") {
        const toMonday = (8 - c.getUTCDay()) % 7 || 7;
        const start = new Date(c.getTime() + (toMonday + (offset - 1) * 7) * DAY_MS);
        return offset ? [start, new Date(start.getTime() + 6 * DAY_MS)] : [c, new Date(start.getTime() - DAY_MS)];
      }
      return null; // quarter/year: keep wording, no dates
    },
  ],
  // "by Friday", "before tomorrow"
  [
    new RegExp(`\\b(?:by|before|until|on|this|next)\\s+(${WEEKDAYS.join("|")}|tomorrow)\\b`, "i"),
    (m, c) => {
      const w = m[1].toLowerCase();
      const add = w === "tomorrow" ? 1 : ((WEEKDAYS.indexOf(w) - c.getUTCDay() + 7) % 7 || 7);
      const d = new Date(c.getTime() + add * DAY_MS);
      return [d, d];
    },
  ],
  [/\b(asap|as soon as possible|urgently)\b/i, () => null],
];

export function findDeadline(text: string, createdDateStr: string): DeadlineMatch | null {
  if (!text) return null;
  const created = new Date(`${createdDateStr}T00:00:00Z`);
  const safeCreated = isNaN(created.getTime()) ? new Date() : created;

  let best: { index: number; length: number; match: RegExpMatchArray; resolve: Resolver } | null = null;
  for (const [re, resolve] of PATTERNS) {
    const match = text.match(re);
    if (!match || match.index === undefined) continue;
    // Earliest mention wins; on a tie, the longer (more specific) phrase wins.
    if (!best || match.index < best.index || (match.index === best.index && match[0].length > best.length)) {
      best = { index: match.index, length: match[0].length, match, resolve };
    }
  }
  if (!best) return null;

  const range = best.resolve(best.match, safeCreated);
  return {
    wording: best.match[0].trim(),
    start: range ? iso(range[0]) : null,
    end: range ? iso(range[1]) : null,
  };
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDay = (isoDate: string) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

/** "Oct 11 to Oct 20, 2026 (2 to 11 days after the message). Exact date to be confirmed during kickoff." */
export function describeWindow(start: string | null, end: string | null, createdDateStr: string): string {
  const confirm = "Exact date to be confirmed during kickoff.";
  if (!start || !end) return `No calendar date can be resolved from this wording. ${confirm}`;
  const created = new Date(`${createdDateStr}T00:00:00Z`).getTime();
  const days = (d: string) => Math.round((new Date(`${d}T00:00:00Z`).getTime() - created) / DAY_MS);
  const year = end.slice(0, 4);
  const range = start === end ? `${fmtDay(start)}, ${year}` : `${fmtDay(start)} to ${fmtDay(end)}, ${year}`;
  const d1 = days(start);
  const d2 = days(end);
  if (isNaN(d1)) return `${range}. ${confirm}`;
  if (d2 < 0) return `${range}, which is before the message date. ${confirm}`;
  const span = d1 === d2 ? `${d1} days` : `${Math.max(d1, 0)} to ${d2} days`;
  return `${range} (${span} after the message). ${confirm}`;
}
