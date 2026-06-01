import { ToolResultSchema } from "../types.js";
import { createErrorResponse, jsonResponse } from "./utils.js";
import { parseDateTimeToUnix } from "./datetime.js";
import {
  CompactOptions,
  humanizeDates,
  compactProtocols,
  compactProtocolTvl,
  compactSeries,
  compactChains,
  compactPools,
  compactStablecoins,
  compactStablecoinData,
  compactOverview,
} from "./transform.js";
import {
  GetProtocolsInput,
  GetProtocolTvlInput,
  GetHistoricalChainTvlInput,
  GetChainTvlInput,
  GetCurrentProtocolTvlInput,
  GetChainsInput,
  GetTokenPricesInput,
  GetHistoricalPricesInput,
  GetBatchHistoricalPricesInput,
  GetPriceChartInput,
  GetPricePercentageChangeInput,
  GetFirstPricesInput,
  GetBlockInput,
  GetStablecoinsInput,
  GetStablecoinChartsAllInput,
  GetStablecoinChartsChainInput,
  GetStablecoinDataInput,
  GetStablecoinChainsInput,
  GetStablecoinPricesInput,
  GetPoolsInput,
  GetPoolChartInput,
  GetDexsOverviewInput,
  GetDexsOverviewByChainInput,
  GetDexSummaryInput,
  GetOptionsOverviewInput,
  GetOptionsOverviewByChainInput,
  GetOptionSummaryInput,
  GetOpenInterestOverviewInput,
  GetFeesOverviewInput,
  GetFeesOverviewByChainInput,
  GetFeeSummaryInput,
  OverviewOptionsInput
} from "./defillama.types.js";
import { OverviewOptions } from "../clients/defillama.client.js";
import { getDefiLlamaClient } from "../clients/defillama.factory.js";

// Get the appropriate client (real or mock) based on TEST_MODE
const defiLlamaClient = getDefiLlamaClient();

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/** Pull the compaction controls out of a handler input. */
const compactOpts = (input: any = {}): CompactOptions => ({
  full: input.full,
  points: input.points,
  limit: input.limit,
  includeTokens: input.includeTokens,
});

/**
 * Build the query for the DEX/options/fees overview & summary endpoints.
 * Charts are excluded by default (huge); pass `full: true` or the explicit
 * exclude flags to change that.
 */
const overviewQuery = (input: OverviewOptionsInput = {}): OverviewOptions => {
  const defaultExclude = !input.full;
  return {
    excludeTotalDataChart: input.excludeTotalDataChart ?? defaultExclude,
    excludeTotalDataChartBreakdown: input.excludeTotalDataChartBreakdown ?? defaultExclude,
    dataType: input.dataType,
  };
};

// ---------------------------------------------------------------------------
// TVL
// ---------------------------------------------------------------------------

export const getProtocolsHandler = async (input: GetProtocolsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getProtocols();
    return jsonResponse(humanizeDates(compactProtocols(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting protocols: ${errorMessage(error)}`);
  }
};

export const getProtocolTvlHandler = async (input: GetProtocolTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getProtocolTvl(input.protocol);
    return jsonResponse(humanizeDates(compactProtocolTvl(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting protocol TVL: ${errorMessage(error)}`);
  }
};

export const getHistoricalChainTvlHandler = async (input: GetHistoricalChainTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getHistoricalChainTvl();
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting historical chain TVL: ${errorMessage(error)}`);
  }
};

export const getChainTvlHandler = async (input: GetChainTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getChainTvl(input.chain);
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting chain TVL: ${errorMessage(error)}`);
  }
};

export const getCurrentProtocolTvlHandler = async (input: GetCurrentProtocolTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getCurrentProtocolTvl(input.protocol);
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting current protocol TVL: ${errorMessage(error)}`);
  }
};

export const getChainsHandler = async (input: GetChainsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getChains();
    return jsonResponse(humanizeDates(compactChains(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting chains: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Coins / Prices
// ---------------------------------------------------------------------------

export const getTokenPricesHandler = async (input: GetTokenPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getTokenPrices(input.coins);
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting token prices: ${errorMessage(error)}`);
  }
};

export const getHistoricalPricesHandler = async (input: GetHistoricalPricesInput): Promise<ToolResultSchema> => {
  try {
    const timestamp = parseDateTimeToUnix(input.timestamp);
    const data = await defiLlamaClient.getHistoricalPrices(input.coins, timestamp);
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting historical prices: ${errorMessage(error)}`);
  }
};

export const getBatchHistoricalPricesHandler = async (input: GetBatchHistoricalPricesInput): Promise<ToolResultSchema> => {
  try {
    const coins: Record<string, number[]> = {};
    for (const [coin, times] of Object.entries(input.coins ?? {})) {
      coins[coin] = (times ?? []).map(parseDateTimeToUnix);
    }
    const data = await defiLlamaClient.getBatchHistoricalPrices(coins, input.searchWidth);
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting batch historical prices: ${errorMessage(error)}`);
  }
};

export const getPriceChartHandler = async (input: GetPriceChartInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getPriceChart(input.coins, {
      start: input.start !== undefined ? parseDateTimeToUnix(input.start) : undefined,
      end: input.end !== undefined ? parseDateTimeToUnix(input.end) : undefined,
      span: input.span,
      period: input.period,
      searchWidth: input.searchWidth,
    });
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting price chart: ${errorMessage(error)}`);
  }
};

export const getPricePercentageChangeHandler = async (input: GetPricePercentageChangeInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getPricePercentageChange(input.coins, {
      timestamp: input.timestamp !== undefined ? parseDateTimeToUnix(input.timestamp) : undefined,
      lookForward: input.lookForward,
      period: input.period,
    });
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting price percentage change: ${errorMessage(error)}`);
  }
};

export const getFirstPricesHandler = async (input: GetFirstPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFirstPrices(input.coins);
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting first prices: ${errorMessage(error)}`);
  }
};

export const getBlockHandler = async (input: GetBlockInput): Promise<ToolResultSchema> => {
  try {
    const timestamp = parseDateTimeToUnix(input.timestamp);
    const data = await defiLlamaClient.getBlock(input.chain, timestamp);
    return jsonResponse(humanizeDates(data));
  } catch (error) {
    return createErrorResponse(`Error getting block: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Stablecoins
// ---------------------------------------------------------------------------

export const getStablecoinsHandler = async (input: GetStablecoinsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoins(input?.includePrices);
    return jsonResponse(humanizeDates(compactStablecoins(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting stablecoins: ${errorMessage(error)}`);
  }
};

export const getStablecoinChartsAllHandler = async (input: GetStablecoinChartsAllInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinChartsAll(input?.stablecoin);
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin charts: ${errorMessage(error)}`);
  }
};

export const getStablecoinChartsChainHandler = async (input: GetStablecoinChartsChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinChartsChain(input.chain, input.stablecoin);
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin charts for chain: ${errorMessage(error)}`);
  }
};

export const getStablecoinDataHandler = async (input: GetStablecoinDataInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinData(input.asset);
    return jsonResponse(humanizeDates(compactStablecoinData(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin data: ${errorMessage(error)}`);
  }
};

export const getStablecoinChainsHandler = async (input: GetStablecoinChainsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinChains();
    return jsonResponse(humanizeDates(input?.full ? data : compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin chains: ${errorMessage(error)}`);
  }
};

export const getStablecoinPricesHandler = async (input: GetStablecoinPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinPrices();
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin prices: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Yields / APY
// ---------------------------------------------------------------------------

export const getPoolsHandler = async (input: GetPoolsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getPools();
    return jsonResponse(humanizeDates(compactPools(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting pools: ${errorMessage(error)}`);
  }
};

export const getPoolChartHandler = async (input: GetPoolChartInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getPoolChart(input.pool);
    return jsonResponse(humanizeDates(compactSeries(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting pool chart: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// DEX / Options volume
// ---------------------------------------------------------------------------

export const getDexsOverviewHandler = async (input: GetDexsOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getDexsOverview(overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting DEXs overview: ${errorMessage(error)}`);
  }
};

export const getDexsOverviewByChainHandler = async (input: GetDexsOverviewByChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getDexsOverviewByChain(input.chain, overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting DEXs overview for chain: ${errorMessage(error)}`);
  }
};

export const getDexSummaryHandler = async (input: GetDexSummaryInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getDexSummary(input.protocol, overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting DEX summary: ${errorMessage(error)}`);
  }
};

export const getOptionsOverviewHandler = async (input: GetOptionsOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOptionsOverview(overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting options overview: ${errorMessage(error)}`);
  }
};

export const getOptionsOverviewByChainHandler = async (input: GetOptionsOverviewByChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOptionsOverviewByChain(input.chain, overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting options overview for chain: ${errorMessage(error)}`);
  }
};

export const getOptionSummaryHandler = async (input: GetOptionSummaryInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOptionSummary(input.protocol, overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting options summary: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Perps / Open interest
// ---------------------------------------------------------------------------

export const getOpenInterestOverviewHandler = async (input: GetOpenInterestOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOpenInterestOverview(overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting open interest overview: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Fees / Revenue
// ---------------------------------------------------------------------------

export const getFeesOverviewHandler = async (input: GetFeesOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFeesOverview(overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting fees overview: ${errorMessage(error)}`);
  }
};

export const getFeesOverviewByChainHandler = async (input: GetFeesOverviewByChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFeesOverviewByChain(input.chain, overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting fees overview for chain: ${errorMessage(error)}`);
  }
};

export const getFeeSummaryHandler = async (input: GetFeeSummaryInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFeeSummary(input.protocol, overviewQuery(input));
    return jsonResponse(humanizeDates(compactOverview(data, compactOpts(input))));
  } catch (error) {
    return createErrorResponse(`Error getting fees summary: ${errorMessage(error)}`);
  }
};
