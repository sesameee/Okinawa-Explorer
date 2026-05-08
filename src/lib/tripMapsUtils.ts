/** Pure helpers for trip + Google Maps (no DOM, no google global). */

export function mapsQueryLink(query: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function timeToMinutesHHMM(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function minutesToHuman(min: number): string {
  const rounded = Math.max(0, Math.round(min));
  if (rounded < 60) return `${rounded} 分`;
  const h = Math.floor(rounded / 60);
  const r = rounded % 60;
  return r ? `${h} 小時 ${r} 分` : `${h} 小時`;
}

/** Day1=Sun ... maps opening_hours weekday index 0=Sun */
export function getTokyoWeekdayIndexFromDayNumber(dayNumber: number): number {
  return (dayNumber - 1) % 7;
}

export function starText(rating: number | undefined): string {
  if (typeof rating !== "number" || !Number.isFinite(rating)) return "—";
  const rounded = Math.round(rating * 2) / 2;
  const filled = Math.max(0, Math.min(5, Math.round(rounded)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

export function timeHHMMToMinutes(hhmm: string): number {
  const s = String(hhmm).replace(":", "");
  const hh = Number(s.slice(0, 2));
  const mm = Number(s.slice(2, 4));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  return hh * 60 + mm;
}

export function isOpenDuringWindow(
  openingHours: google.maps.places.PlaceOpeningHours | undefined,
  weekdayIdx: number,
  startHHMM: string,
  endHHMM: string,
): boolean | null {
  try {
    if (
      !openingHours ||
      !Array.isArray(openingHours.periods) ||
      openingHours.periods.length === 0
    )
      return null;
    const startMin = timeToMinutesHHMM(startHHMM);
    const endMin = timeToMinutesHHMM(endHHMM);
    if (endMin <= startMin) return null;

    const periods = openingHours.periods;
    const needed = [startMin, endMin - 1];

    const within = (min: number): boolean => {
      const minutes = min;
      for (const period of periods) {
        if (!period || !period.open || !period.close) continue;
        const open = period.open;
        const close = period.close;
        const openDay = open.day as number;
        const closeDay = close.day as number;
        const openMins = timeHHMMToMinutes(open.time ?? "");
        const closeMins = timeHHMMToMinutes(close.time ?? "");

        const openMatches = openDay === weekdayIdx;
        const closeMatches = closeDay === weekdayIdx;

        if (!openMatches && !closeMatches) continue;

        if (openMatches && closeDay === openDay) {
          if (minutes >= openMins && minutes < closeMins) return true;
        } else if (openMatches && closeDay === (openDay + 1) % 7) {
          if (minutes >= openMins || minutes < closeMins) return true;
        } else if (!openMatches && closeMatches) {
          if (minutes < closeMins) return true;
        }
      }
      return false;
    };

    return within(needed[0]) && within(needed[1]);
  } catch {
    return null;
  }
}

export function statusClass(openStatus: boolean | null): string {
  if (openStatus === true) return "text-emerald-400 font-bold";
  if (openStatus === false) return "text-red-400 font-bold";
  return "text-amber-500 font-bold";
}

export function normalizeForMatch(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u3000\s]+/g, " ")
    .replace(/[|·・]/g, " ")
    .replace(/[^0-9a-z& \u4e00-\u9fff\u3040-\u30ff\u30a0-\u30ff\u3400-\u4dbf]/giu, "")
    .replace(/[\-_/]+/g, " ")
    .trim();
}

export function tokenizeForMatch(s: string): string[] {
  const cleaned = normalizeForMatch(s);
  if (!cleaned) return [];
  return cleaned
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

export function candidateScore(
  candidate: google.maps.places.PlaceResult,
  expectedTokens: string[],
  expectedRaw: string,
): number {
  if (!candidate) return 0;
  const name = candidate.name || "";
  const addr = candidate.formatted_address || "";
  const nameNorm = normalizeForMatch(name);

  const expectedNorm = normalizeForMatch(expectedRaw);
  let score = 0;
  if (expectedNorm && nameNorm.includes(expectedNorm)) score += 2.0;
  if (expectedNorm && addr && normalizeForMatch(addr).includes(expectedNorm)) score += 1.0;

  const nameTokens = tokenizeForMatch(name);
  if (!expectedTokens.length || !nameTokens.length) return score;

  const nameSet = new Set(nameTokens);
  let inter = 0;
  for (const t of expectedTokens) {
    if (nameSet.has(t)) inter += 1;
  }
  score += inter / expectedTokens.length;
  return score;
}
