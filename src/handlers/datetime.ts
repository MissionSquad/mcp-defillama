/**
 * Date/time helpers.
 *
 * Tools accept and return human-readable 12-hour datetime strings, e.g.
 *   "06/15/2024 03:30:00 PM"            (UTC assumed)
 *   "06/15/2024 03:30 PM America/New_York"
 *   "06/15/2024 03:30 PM +05:30"
 *
 * Input is always converted to UTC before being sent to DefiLlama (which works
 * in UNIX seconds). Output UNIX timestamps are rendered back to UTC strings.
 */

import { DateTime } from "luxon";

/** The canonical output format, e.g. "06/01/2026 04:37:45 PM UTC". */
const OUTPUT_FORMAT = "MM/dd/yyyy hh:mm:ss a 'UTC'";

/** Accepted input formats, tried in order (all interpreted in the given zone). */
const INPUT_FORMATS = [
  "M/d/yyyy h:mm:ss a",
  "M/d/yyyy h:mm a",
  "M/d/yyyy h a",
  "M/d/yyyy",
  "yyyy-MM-dd h:mm:ss a",
  "yyyy-MM-dd h:mm a",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd",
];

/** Matches a trailing timezone token: IANA name, numeric offset, or UTC/GMT/Z. */
const TZ_SUFFIX = /\s+([A-Za-z]+\/[A-Za-z0-9_+-]+|[+-]\d{2}:?\d{2}|Z|UTC|GMT)\s*$/;

const EXAMPLE = `e.g. "06/15/2024 03:30:00 PM" (UTC assumed), "06/15/2024 03:30 PM America/New_York", or "06/15/2024 03:30 PM +05:30"`;

/** Normalize a timezone token into something luxon understands. */
function normalizeZone(token: string): string {
  const upper = token.toUpperCase();
  if (upper === "Z" || upper === "UTC" || upper === "GMT") {
    return "utc";
  }
  // Numeric offset like "+05:30" / "-0800" -> luxon "UTC+05:30".
  if (/^[+-]\d{2}:?\d{2}$/.test(token)) {
    const sign = token[0];
    const digits = token.slice(1).replace(":", "");
    return `UTC${sign}${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  // Otherwise assume an IANA zone name (validated by luxon below).
  return token;
}

/**
 * Parse a human datetime string (or UNIX seconds) into UTC UNIX seconds.
 * Numbers and all-digit strings are treated as UNIX seconds and passed through.
 */
export function parseDateTimeToUnix(input: string | number): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new Error(`Invalid timestamp: ${input}`);
    }
    return Math.floor(input);
  }

  const raw = String(input).trim();
  if (raw === "") {
    throw new Error("Timestamp is required");
  }
  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }

  let zone = "utc";
  let dateStr = raw;
  const tzMatch = raw.match(TZ_SUFFIX);
  if (tzMatch) {
    zone = normalizeZone(tzMatch[1]);
    dateStr = raw.slice(0, raw.length - tzMatch[0].length).trim();
  }

  for (const format of INPUT_FORMATS) {
    const dt = DateTime.fromFormat(dateStr, format, { zone });
    if (dt.isValid) {
      return Math.floor(dt.toUTC().toSeconds());
    }
  }

  // Fall back to ISO 8601 (which may carry its own offset).
  const iso = DateTime.fromISO(raw, { zone: "utc", setZone: true });
  if (iso.isValid) {
    return Math.floor(iso.toUTC().toSeconds());
  }

  throw new Error(`Invalid date/time "${raw}". Expected a 12-hour datetime, ${EXAMPLE}.`);
}

/** Render a UNIX timestamp (seconds, or milliseconds if large) as a UTC string. */
export function formatUnixToDateTime(value: number): string {
  let seconds = value;
  if (Math.abs(value) >= 1e12) {
    seconds = Math.floor(value / 1000); // value was in milliseconds
  }
  const dt = DateTime.fromSeconds(seconds, { zone: "utc" });
  return dt.isValid ? dt.toFormat(OUTPUT_FORMAT) : String(value);
}
