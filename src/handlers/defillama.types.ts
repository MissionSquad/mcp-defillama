// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** A 12-hour datetime string ("06/15/2024 03:30 PM", UTC assumed) or UNIX seconds. */
export type DateTimeInput = string | number;

/** Options that control response compaction (all optional). */
export interface CompactInput {
  /** Return the complete, untrimmed response instead of the compact default. */
  full?: boolean;
}

/** Adds a downsampling control for time-series responses. */
export interface SeriesCompactInput extends CompactInput {
  /** Max number of data points to keep (default 30). */
  points?: number;
}

/** Adds an item cap for list responses. */
export interface ListCompactInput extends CompactInput {
  /** Max number of items to keep. */
  limit?: number;
}

/** Query options shared by the DEX/options/fees overview & summary endpoints. */
export interface OverviewOptionsInput extends CompactInput {
  excludeTotalDataChart?: boolean;
  excludeTotalDataChartBreakdown?: boolean;
  dataType?: string;
  /** Max number of chart points to keep (default 30). */
  points?: number;
  /** Max number of protocols to keep in the breakdown. */
  limit?: number;
}

// ---------------------------------------------------------------------------
// TVL
// ---------------------------------------------------------------------------

export interface GetProtocolsInput extends ListCompactInput {}

export interface GetProtocolTvlInput extends SeriesCompactInput {
  protocol: string;
  /** Include token-level balances/breakdowns in the response. */
  includeTokens?: boolean;
}

export interface GetHistoricalChainTvlInput extends SeriesCompactInput {}

export interface GetChainTvlInput extends SeriesCompactInput {
  chain: string;
}

export interface GetCurrentProtocolTvlInput {
  protocol: string;
}

export interface GetChainsInput extends ListCompactInput {}

// ---------------------------------------------------------------------------
// Coins / Prices
// ---------------------------------------------------------------------------

export interface GetTokenPricesInput {
  coins: string[];
}

export interface GetHistoricalPricesInput {
  coins: string[];
  timestamp: DateTimeInput;
}

export interface GetBatchHistoricalPricesInput {
  /** Map of coin identifier to an array of datetime strings or UNIX seconds. */
  coins: Record<string, DateTimeInput[]>;
  searchWidth?: string;
}

export interface GetPriceChartInput extends SeriesCompactInput {
  coins: string[];
  start?: DateTimeInput;
  end?: DateTimeInput;
  span?: number;
  period?: string;
  searchWidth?: string;
}

export interface GetPricePercentageChangeInput {
  coins: string[];
  timestamp?: DateTimeInput;
  lookForward?: boolean;
  period?: string;
}

export interface GetFirstPricesInput {
  coins: string[];
}

export interface GetBlockInput {
  chain: string;
  timestamp: DateTimeInput;
}

// ---------------------------------------------------------------------------
// Stablecoins
// ---------------------------------------------------------------------------

export interface GetStablecoinsInput extends ListCompactInput {
  includePrices?: boolean;
}

export interface GetStablecoinChartsAllInput extends SeriesCompactInput {
  stablecoin?: number | string;
}

export interface GetStablecoinChartsChainInput extends SeriesCompactInput {
  chain: string;
  stablecoin?: number | string;
}

export interface GetStablecoinDataInput extends SeriesCompactInput {
  asset: string;
  /** Include token-level breakdowns in the response. */
  includeTokens?: boolean;
}

export interface GetStablecoinChainsInput extends CompactInput {}

export interface GetStablecoinPricesInput extends SeriesCompactInput {}

// ---------------------------------------------------------------------------
// Yields / APY
// ---------------------------------------------------------------------------

export interface GetPoolsInput extends ListCompactInput {}

export interface GetPoolChartInput extends SeriesCompactInput {
  pool: string;
}

// ---------------------------------------------------------------------------
// DEX / Options volume
// ---------------------------------------------------------------------------

export interface GetDexsOverviewInput extends OverviewOptionsInput {}

export interface GetDexsOverviewByChainInput extends OverviewOptionsInput {
  chain: string;
}

export interface GetDexSummaryInput extends OverviewOptionsInput {
  protocol: string;
}

export interface GetOptionsOverviewInput extends OverviewOptionsInput {}

export interface GetOptionsOverviewByChainInput extends OverviewOptionsInput {
  chain: string;
}

export interface GetOptionSummaryInput extends OverviewOptionsInput {
  protocol: string;
}

// ---------------------------------------------------------------------------
// Perps / Open interest
// ---------------------------------------------------------------------------

export interface GetOpenInterestOverviewInput extends OverviewOptionsInput {}

// ---------------------------------------------------------------------------
// Fees / Revenue
// ---------------------------------------------------------------------------

export interface GetFeesOverviewInput extends OverviewOptionsInput {}

export interface GetFeesOverviewByChainInput extends OverviewOptionsInput {
  chain: string;
}

export interface GetFeeSummaryInput extends OverviewOptionsInput {
  protocol: string;
}
