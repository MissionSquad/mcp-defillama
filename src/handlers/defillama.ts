import { ToolResultSchema } from "../types.js";
import { createErrorResponse, createSuccessResponse } from "./utils.js";
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

/** Pull the shared overview/summary query options out of a handler input. */
const overviewOptions = (input: OverviewOptionsInput = {}): OverviewOptions => ({
  excludeTotalDataChart: input.excludeTotalDataChart,
  excludeTotalDataChartBreakdown: input.excludeTotalDataChartBreakdown,
  dataType: input.dataType,
});

// ---------------------------------------------------------------------------
// TVL
// ---------------------------------------------------------------------------

export const getProtocolsHandler = async (_input: GetProtocolsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getProtocols();
    return createSuccessResponse(`Protocols: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting protocols: ${errorMessage(error)}`);
  }
};

export const getProtocolTvlHandler = async (input: GetProtocolTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getProtocolTvl(input.protocol);
    return createSuccessResponse(`Protocol TVL: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting protocol TVL: ${errorMessage(error)}`);
  }
};

export const getHistoricalChainTvlHandler = async (_input: GetHistoricalChainTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getHistoricalChainTvl();
    return createSuccessResponse(`Historical chain TVL: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting historical chain TVL: ${errorMessage(error)}`);
  }
};

export const getChainTvlHandler = async (input: GetChainTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getChainTvl(input.chain);
    return createSuccessResponse(`Chain TVL: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting chain TVL: ${errorMessage(error)}`);
  }
};

export const getCurrentProtocolTvlHandler = async (input: GetCurrentProtocolTvlInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getCurrentProtocolTvl(input.protocol);
    return createSuccessResponse(`Current protocol TVL: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting current protocol TVL: ${errorMessage(error)}`);
  }
};

export const getChainsHandler = async (_input: GetChainsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getChains();
    return createSuccessResponse(`Chains: ${JSON.stringify(data, null, 2)}`);
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
    return createSuccessResponse(`Token prices: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting token prices: ${errorMessage(error)}`);
  }
};

export const getHistoricalPricesHandler = async (input: GetHistoricalPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getHistoricalPrices(input.coins, input.timestamp);
    return createSuccessResponse(`Historical prices: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting historical prices: ${errorMessage(error)}`);
  }
};

export const getBatchHistoricalPricesHandler = async (input: GetBatchHistoricalPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getBatchHistoricalPrices(input.coins, input.searchWidth);
    return createSuccessResponse(`Batch historical prices: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting batch historical prices: ${errorMessage(error)}`);
  }
};

export const getPriceChartHandler = async (input: GetPriceChartInput): Promise<ToolResultSchema> => {
  try {
    const { coins, ...options } = input;
    const data = await defiLlamaClient.getPriceChart(coins, options);
    return createSuccessResponse(`Price chart: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting price chart: ${errorMessage(error)}`);
  }
};

export const getPricePercentageChangeHandler = async (input: GetPricePercentageChangeInput): Promise<ToolResultSchema> => {
  try {
    const { coins, ...options } = input;
    const data = await defiLlamaClient.getPricePercentageChange(coins, options);
    return createSuccessResponse(`Price percentage change: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting price percentage change: ${errorMessage(error)}`);
  }
};

export const getFirstPricesHandler = async (input: GetFirstPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFirstPrices(input.coins);
    return createSuccessResponse(`First prices: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting first prices: ${errorMessage(error)}`);
  }
};

export const getBlockHandler = async (input: GetBlockInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getBlock(input.chain, input.timestamp);
    return createSuccessResponse(`Block: ${JSON.stringify(data, null, 2)}`);
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
    return createSuccessResponse(`Stablecoins: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoins: ${errorMessage(error)}`);
  }
};

export const getStablecoinChartsAllHandler = async (input: GetStablecoinChartsAllInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinChartsAll(input?.stablecoin);
    return createSuccessResponse(`Stablecoin charts (all): ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin charts: ${errorMessage(error)}`);
  }
};

export const getStablecoinChartsChainHandler = async (input: GetStablecoinChartsChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinChartsChain(input.chain, input.stablecoin);
    return createSuccessResponse(`Stablecoin charts (chain): ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin charts for chain: ${errorMessage(error)}`);
  }
};

export const getStablecoinDataHandler = async (input: GetStablecoinDataInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinData(input.asset);
    return createSuccessResponse(`Stablecoin data: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin data: ${errorMessage(error)}`);
  }
};

export const getStablecoinChainsHandler = async (_input: GetStablecoinChainsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinChains();
    return createSuccessResponse(`Stablecoin chains: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin chains: ${errorMessage(error)}`);
  }
};

export const getStablecoinPricesHandler = async (_input: GetStablecoinPricesInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getStablecoinPrices();
    return createSuccessResponse(`Stablecoin prices: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin prices: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Yields / APY
// ---------------------------------------------------------------------------

export const getPoolsHandler = async (_input: GetPoolsInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getPools();
    return createSuccessResponse(`Pools: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting pools: ${errorMessage(error)}`);
  }
};

export const getPoolChartHandler = async (input: GetPoolChartInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getPoolChart(input.pool);
    return createSuccessResponse(`Pool chart: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting pool chart: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// DEX / Options volume
// ---------------------------------------------------------------------------

export const getDexsOverviewHandler = async (input: GetDexsOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getDexsOverview(overviewOptions(input));
    return createSuccessResponse(`DEXs overview: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting DEXs overview: ${errorMessage(error)}`);
  }
};

export const getDexsOverviewByChainHandler = async (input: GetDexsOverviewByChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getDexsOverviewByChain(input.chain, overviewOptions(input));
    return createSuccessResponse(`DEXs overview (chain): ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting DEXs overview for chain: ${errorMessage(error)}`);
  }
};

export const getDexSummaryHandler = async (input: GetDexSummaryInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getDexSummary(input.protocol, overviewOptions(input));
    return createSuccessResponse(`DEX summary: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting DEX summary: ${errorMessage(error)}`);
  }
};

export const getOptionsOverviewHandler = async (input: GetOptionsOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOptionsOverview(overviewOptions(input));
    return createSuccessResponse(`Options overview: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting options overview: ${errorMessage(error)}`);
  }
};

export const getOptionsOverviewByChainHandler = async (input: GetOptionsOverviewByChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOptionsOverviewByChain(input.chain, overviewOptions(input));
    return createSuccessResponse(`Options overview (chain): ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting options overview for chain: ${errorMessage(error)}`);
  }
};

export const getOptionSummaryHandler = async (input: GetOptionSummaryInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOptionSummary(input.protocol, overviewOptions(input));
    return createSuccessResponse(`Options summary: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting options summary: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Perps / Open interest
// ---------------------------------------------------------------------------

export const getOpenInterestOverviewHandler = async (input: GetOpenInterestOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getOpenInterestOverview(overviewOptions(input));
    return createSuccessResponse(`Open interest overview: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting open interest overview: ${errorMessage(error)}`);
  }
};

// ---------------------------------------------------------------------------
// Fees / Revenue
// ---------------------------------------------------------------------------

export const getFeesOverviewHandler = async (input: GetFeesOverviewInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFeesOverview(overviewOptions(input));
    return createSuccessResponse(`Fees overview: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting fees overview: ${errorMessage(error)}`);
  }
};

export const getFeesOverviewByChainHandler = async (input: GetFeesOverviewByChainInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFeesOverviewByChain(input.chain, overviewOptions(input));
    return createSuccessResponse(`Fees overview (chain): ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting fees overview for chain: ${errorMessage(error)}`);
  }
};

export const getFeeSummaryHandler = async (input: GetFeeSummaryInput): Promise<ToolResultSchema> => {
  try {
    const data = await defiLlamaClient.getFeeSummary(input.protocol, overviewOptions(input));
    return createSuccessResponse(`Fees summary: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting fees summary: ${errorMessage(error)}`);
  }
};
