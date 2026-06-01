// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** Query options shared by the DEX/options/fees overview & summary endpoints. */
export interface OverviewOptionsInput {
  excludeTotalDataChart?: boolean;
  excludeTotalDataChartBreakdown?: boolean;
  dataType?: string;
}

// ---------------------------------------------------------------------------
// TVL
// ---------------------------------------------------------------------------

export interface GetProtocolsInput {
  // No input parameters needed
}

export interface GetProtocolTvlInput {
  protocol: string;
}

export interface GetHistoricalChainTvlInput {
  // No input parameters needed
}

export interface GetChainTvlInput {
  chain: string;
}

export interface GetCurrentProtocolTvlInput {
  protocol: string;
}

export interface GetChainsInput {
  // No input parameters needed
}

// ---------------------------------------------------------------------------
// Coins / Prices
// ---------------------------------------------------------------------------

export interface GetTokenPricesInput {
  coins: string[];
}

export interface GetHistoricalPricesInput {
  coins: string[];
  timestamp: number;
}

export interface GetBatchHistoricalPricesInput {
  coins: Record<string, number[]>;
  searchWidth?: string;
}

export interface GetPriceChartInput {
  coins: string[];
  start?: number;
  end?: number;
  span?: number;
  period?: string;
  searchWidth?: string;
}

export interface GetPricePercentageChangeInput {
  coins: string[];
  timestamp?: number;
  lookForward?: boolean;
  period?: string;
}

export interface GetFirstPricesInput {
  coins: string[];
}

export interface GetBlockInput {
  chain: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Stablecoins
// ---------------------------------------------------------------------------

export interface GetStablecoinsInput {
  includePrices?: boolean;
}

export interface GetStablecoinChartsAllInput {
  stablecoin?: number | string;
}

export interface GetStablecoinChartsChainInput {
  chain: string;
  stablecoin?: number | string;
}

export interface GetStablecoinDataInput {
  asset: string;
}

export interface GetStablecoinChainsInput {
  // No input parameters needed
}

export interface GetStablecoinPricesInput {
  // No input parameters needed
}

// ---------------------------------------------------------------------------
// Yields / APY
// ---------------------------------------------------------------------------

export interface GetPoolsInput {
  // No input parameters needed
}

export interface GetPoolChartInput {
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
