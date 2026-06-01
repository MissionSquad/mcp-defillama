/**
 * Response transforms that make DefiLlama payloads small and model-friendly.
 *
 * Two passes run on every response:
 *   1. compaction  — trim noisy fields, cap list lengths, downsample series.
 *   2. humanizeDates — render UNIX date/timestamp fields as UTC datetime strings.
 *
 * Compaction is opt-out: pass `full: true` to get the untouched response.
 */

import { formatUnixToDateTime } from "./datetime.js";

export interface CompactOptions {
  /** Return the complete, untrimmed response. */
  full?: boolean;
  /** Max number of points to keep when downsampling a time series. */
  points?: number;
  /** Max number of items to keep for list endpoints. */
  limit?: number;
  /** Include token-level breakdowns (protocol/stablecoin detail endpoints). */
  includeTokens?: boolean;
}

const DEFAULT_POINTS = 30;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

const isObject = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Evenly downsample an array to at most `max` items, always keeping the ends. */
export function downsample<T>(arr: T[], max: number): T[] {
  if (!Array.isArray(arr) || max <= 0 || arr.length <= max) return arr;
  if (max === 1) return [arr[arr.length - 1]];
  const result: T[] = [];
  const step = (arr.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) {
    result.push(arr[Math.round(i * step)]);
  }
  return result;
}

/** Keep only the listed keys that are actually present on an object. */
function pickFields<T extends Record<string, any>>(obj: T, fields: string[]): Partial<T> {
  const out: Partial<T> = {};
  for (const key of fields) {
    if (obj[key] !== undefined) {
      (out as Record<string, any>)[key] = obj[key];
    }
  }
  return out;
}

/** Downsample every array found anywhere in the structure (for chart payloads). */
function deepDownsample(value: any, max: number): any {
  if (Array.isArray(value)) {
    return downsample(value, max).map(item => deepDownsample(item, max));
  }
  if (isObject(value)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepDownsample(v, max);
    }
    return out;
  }
  return value;
}

/** Trim an entity list: sort (desc) by a key, cap length, and pick fields. */
function trimList(
  arr: any[],
  fields: string[],
  limit: number,
  sortKey?: string
): { total: number; returned: number; items: any[] } {
  let items = arr;
  if (sortKey) {
    items = [...arr].sort((a, b) => (Number(b?.[sortKey]) || 0) - (Number(a?.[sortKey]) || 0));
  }
  const sliced = items.slice(0, limit).map(item => (isObject(item) ? pickFields(item, fields) : item));
  return { total: arr.length, returned: sliced.length, items: sliced };
}

// ---------------------------------------------------------------------------
// Date humanizing
// ---------------------------------------------------------------------------

const DATE_KEYS = new Set(["date", "timestamp", "t", "startTime", "endTime"]);
// Plausible UNIX range (~2001 in seconds up to year ~5138 in seconds / ms).
const looksLikeUnix = (n: number) => Number.isFinite(n) && Math.abs(n) >= 1e9;

/** Recursively render date/timestamp fields as UTC datetime strings. */
export function humanizeDates(value: any): any {
  if (Array.isArray(value)) {
    return value.map(humanizeDates);
  }
  if (isObject(value)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (DATE_KEYS.has(k) && typeof v === "number" && looksLikeUnix(v)) {
        out[k] = formatUnixToDateTime(v);
      } else {
        out[k] = humanizeDates(v);
      }
    }
    return out;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Endpoint-specific compactors
// ---------------------------------------------------------------------------

const PROTOCOL_FIELDS = [
  "name", "symbol", "category", "chain", "chains", "tvl",
  "change_1h", "change_1d", "change_7d", "mcap",
];

export function compactProtocols(data: any, opts: CompactOptions = {}): any {
  if (opts.full || !Array.isArray(data)) return data;
  const { total, returned, items } = trimList(data, PROTOCOL_FIELDS, opts.limit ?? 100, "tvl");
  return { total, returned, protocols: items };
}

export function compactProtocolTvl(data: any, opts: CompactOptions = {}): any {
  if (opts.full || !isObject(data)) return data;
  const points = opts.points ?? DEFAULT_POINTS;

  const out: Record<string, any> = pickFields(data, [
    "name", "symbol", "url", "category", "chains", "currentChainTvls", "tvlPriceChange",
  ]);

  // Aggregate TVL: the API may return `tvl` as a number or a historical series.
  const series = Array.isArray(data.tvl) ? data.tvl
    : Array.isArray(data.tvlList) ? data.tvlList
    : undefined;
  if (series) {
    out.tvl = downsample(series, points);
  } else if (typeof data.tvl === "number") {
    out.tvl = data.tvl;
  }

  if (opts.includeTokens) {
    if (data.tokens !== undefined) out.tokens = data.tokens;
    if (Array.isArray(data.tokensInUsd)) out.tokensInUsd = downsample(data.tokensInUsd, points);
  }

  return out;
}

/** A plain time series (array of dated points), e.g. historical chain TVL. */
export function compactSeries(data: any, opts: CompactOptions = {}): any {
  if (opts.full) return data;
  return deepDownsample(data, opts.points ?? DEFAULT_POINTS);
}

const CHAIN_FIELDS = ["name", "tvl", "tokenSymbol", "chainId", "gecko_id"];

export function compactChains(data: any, opts: CompactOptions = {}): any {
  if (opts.full || !Array.isArray(data)) return data;
  const { total, returned, items } = trimList(data, CHAIN_FIELDS, opts.limit ?? 200, "tvl");
  return { total, returned, chains: items };
}

const POOL_FIELDS = [
  "pool", "chain", "project", "symbol", "tvlUsd",
  "apy", "apyBase", "apyReward", "stablecoin", "ilRisk", "exposure",
];

export function compactPools(data: any, opts: CompactOptions = {}): any {
  if (opts.full) return data;
  // /pools returns { status, data: [...] }.
  const pools = isObject(data) && Array.isArray(data.data) ? data.data : data;
  if (!Array.isArray(pools)) return data;
  const { total, returned, items } = trimList(pools, POOL_FIELDS, opts.limit ?? 50, "tvlUsd");
  return { total, returned, pools: items };
}

const STABLECOIN_FIELDS = ["id", "name", "symbol", "pegType", "pegMechanism", "price", "circulating"];

export function compactStablecoins(data: any, opts: CompactOptions = {}): any {
  if (opts.full || !isObject(data) || !Array.isArray(data.peggedAssets)) return data;
  const { total, returned, items } = trimList(data.peggedAssets, STABLECOIN_FIELDS, opts.limit ?? 100, "circulating");
  return { total, returned, peggedAssets: items };
}

export function compactStablecoinData(data: any, opts: CompactOptions = {}): any {
  if (opts.full || !isObject(data)) return data;
  const out: Record<string, any> = pickFields(data, [
    "id", "name", "symbol", "pegType", "pegMechanism", "priceSource", "price",
    "circulating", "circulatingPrevDay", "circulatingPrevWeek", "circulating7dAgo",
    "chainCirculating", "delisted",
  ]);
  if (opts.includeTokens && Array.isArray(data.tokens)) {
    out.tokens = downsample(data.tokens, opts.points ?? DEFAULT_POINTS);
  }
  return out;
}

const OVERVIEW_PROTOCOL_FIELDS = [
  "name", "displayName", "category", "chains",
  "total24h", "total7d", "total30d", "totalAllTime",
  "change_1d", "change_7d", "change_1m",
];

const OVERVIEW_TOP_FIELDS = [
  "total24h", "total7d", "total30d", "totalAllTime",
  "change_1d", "change_7d", "change_1m",
  "totalDataChart", "totalDataChartBreakdown",
  "allChains", "chain", "protocols",
];

export function compactOverview(data: any, opts: CompactOptions = {}): any {
  if (opts.full || !isObject(data)) return data;
  const points = opts.points ?? DEFAULT_POINTS;
  const out: Record<string, any> = pickFields(data, OVERVIEW_TOP_FIELDS);

  if (Array.isArray(out.totalDataChart)) out.totalDataChart = downsample(out.totalDataChart, points);
  if (Array.isArray(out.totalDataChartBreakdown)) out.totalDataChartBreakdown = downsample(out.totalDataChartBreakdown, points);

  if (Array.isArray(out.protocols)) {
    const { total, returned, items } = trimList(out.protocols, OVERVIEW_PROTOCOL_FIELDS, opts.limit ?? 50, "total24h");
    out.protocols = items;
    out.totalProtocols = total;
    out.returnedProtocols = returned;
  }

  return out;
}
