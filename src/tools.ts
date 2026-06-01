import {
  getProtocolsHandler,
  getProtocolTvlHandler,
  getHistoricalChainTvlHandler,
  getChainTvlHandler,
  getCurrentProtocolTvlHandler,
  getChainsHandler,
  getTokenPricesHandler,
  getHistoricalPricesHandler,
  getBatchHistoricalPricesHandler,
  getPriceChartHandler,
  getPricePercentageChangeHandler,
  getFirstPricesHandler,
  getBlockHandler,
  getStablecoinsHandler,
  getStablecoinChartsAllHandler,
  getStablecoinChartsChainHandler,
  getStablecoinDataHandler,
  getStablecoinChainsHandler,
  getStablecoinPricesHandler,
  getPoolsHandler,
  getPoolChartHandler,
  getDexsOverviewHandler,
  getDexsOverviewByChainHandler,
  getDexSummaryHandler,
  getOptionsOverviewHandler,
  getOptionsOverviewByChainHandler,
  getOptionSummaryHandler,
  getOpenInterestOverviewHandler,
  getFeesOverviewHandler,
  getFeesOverviewByChainHandler,
  getFeeSummaryHandler
} from "./handlers/defillama.js";

// Query options shared by the DEX/options/fees overview & summary endpoints.
const overviewProperties = {
  excludeTotalDataChart: {
    type: "boolean",
    description: "Exclude the aggregated chart from the response"
  },
  excludeTotalDataChartBreakdown: {
    type: "boolean",
    description: "Exclude the broken-down chart from the response"
  },
  dataType: {
    type: "string",
    description: "Metric to return (e.g. dailyVolume, dailyFees, dailyRevenue)"
  }
};

const coinsProperty = {
  type: "array",
  description: "Coin identifiers, e.g. \"ethereum:0xc02aaa...\" or \"coingecko:ethereum\"",
  items: { type: "string" }
};

export const tools = [
  // -------------------------------------------------------------------------
  // TVL
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_protocols",
    description: "List all protocols tracked by DefiLlama along with their TVL",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "defillama_get_protocol_tvl",
    description: "Get the full historical TVL breakdown for a specific protocol",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "Protocol slug, e.g. aave" } },
      required: ["protocol"]
    }
  },
  {
    name: "defillama_get_historical_chain_tvl",
    description: "Get historical TVL across all chains combined",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "defillama_get_chain_tvl",
    description: "Get historical TVL data for a specific chain",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" } },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_current_protocol_tvl",
    description: "Get the current TVL of a protocol as a single number",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "Protocol slug, e.g. aave" } },
      required: ["protocol"]
    }
  },
  {
    name: "defillama_get_chains",
    description: "Get the current TVL of every chain tracked by DefiLlama",
    inputSchema: { type: "object", properties: {}, required: [] }
  },

  // -------------------------------------------------------------------------
  // Coins / Prices
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_token_prices",
    description: "Get current prices of tokens by contract address",
    inputSchema: {
      type: "object",
      properties: { coins: coinsProperty },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_historical_prices",
    description: "Get token prices at a given historical timestamp",
    inputSchema: {
      type: "object",
      properties: {
        coins: coinsProperty,
        timestamp: { type: "number", description: "UNIX timestamp (seconds)" }
      },
      required: ["coins", "timestamp"]
    }
  },
  {
    name: "defillama_get_batch_historical_prices",
    description: "Get historical prices for multiple coins at multiple timestamps",
    inputSchema: {
      type: "object",
      properties: {
        coins: {
          type: "object",
          description: "Map of coin identifier to an array of UNIX timestamps, e.g. {\"ethereum:0x..\":[1666876743]}",
          additionalProperties: { type: "array", items: { type: "number" } }
        },
        searchWidth: { type: "string", description: "Time range to search around each timestamp, e.g. 600 or 4h" }
      },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_price_chart",
    description: "Get a price chart (token prices over time) for the given coins",
    inputSchema: {
      type: "object",
      properties: {
        coins: coinsProperty,
        start: { type: "number", description: "Start UNIX timestamp (seconds)" },
        end: { type: "number", description: "End UNIX timestamp (seconds)" },
        span: { type: "number", description: "Number of data points to return" },
        period: { type: "string", description: "Duration between data points, e.g. 2d, 1h" },
        searchWidth: { type: "string", description: "Time range to search around each point" }
      },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_price_percentage_change",
    description: "Get the percentage price change for the given coins over a period",
    inputSchema: {
      type: "object",
      properties: {
        coins: coinsProperty,
        timestamp: { type: "number", description: "Reference UNIX timestamp (defaults to now)" },
        lookForward: { type: "boolean", description: "Look forward from the timestamp instead of backward" },
        period: { type: "string", description: "Duration to measure the change over, e.g. 3w, 1d" }
      },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_first_prices",
    description: "Get the earliest recorded price for the given coins",
    inputSchema: {
      type: "object",
      properties: { coins: coinsProperty },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_block",
    description: "Get the block height closest to a timestamp on a given chain",
    inputSchema: {
      type: "object",
      properties: {
        chain: { type: "string", description: "Chain name, e.g. ethereum" },
        timestamp: { type: "number", description: "UNIX timestamp (seconds)" }
      },
      required: ["chain", "timestamp"]
    }
  },

  // -------------------------------------------------------------------------
  // Stablecoins
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_stablecoins",
    description: "List all stablecoins with their circulating amounts",
    inputSchema: {
      type: "object",
      properties: { includePrices: { type: "boolean", description: "Include current stablecoin prices" } },
      required: []
    }
  },
  {
    name: "defillama_get_stablecoin_charts_all",
    description: "Get the historical market cap sum of all stablecoins",
    inputSchema: {
      type: "object",
      properties: { stablecoin: { type: "number", description: "Optional stablecoin ID to filter by" } },
      required: []
    }
  },
  {
    name: "defillama_get_stablecoin_charts_chain",
    description: "Get the historical stablecoin market cap on a specific chain",
    inputSchema: {
      type: "object",
      properties: {
        chain: { type: "string", description: "Chain name, e.g. ethereum" },
        stablecoin: { type: "number", description: "Optional stablecoin ID to filter by" }
      },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_stablecoin_data",
    description: "Get historical data for a specific stablecoin",
    inputSchema: {
      type: "object",
      properties: { asset: { type: "string", description: "Stablecoin ID or name" } },
      required: ["asset"]
    }
  },
  {
    name: "defillama_get_stablecoin_chains",
    description: "Get current stablecoin totals for each chain",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "defillama_get_stablecoin_prices",
    description: "Get historical prices of stablecoins",
    inputSchema: { type: "object", properties: {}, required: [] }
  },

  // -------------------------------------------------------------------------
  // Yields / APY
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_pools",
    description: "Get the latest TVL and APY data for all yield pools",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "defillama_get_pool_chart",
    description: "Get historical APY and TVL for a specific yield pool",
    inputSchema: {
      type: "object",
      properties: { pool: { type: "string", description: "Pool ID (uuid from /pools)" } },
      required: ["pool"]
    }
  },

  // -------------------------------------------------------------------------
  // DEX / Options volume
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_dexs_overview",
    description: "Get a DEX trading volume overview across all chains",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },
  {
    name: "defillama_get_dexs_overview_by_chain",
    description: "Get a DEX trading volume overview for a specific chain",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" }, ...overviewProperties },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_dex_summary",
    description: "Get a DEX trading volume summary for a specific protocol",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "DEX protocol slug, e.g. uniswap" }, ...overviewProperties },
      required: ["protocol"]
    }
  },
  {
    name: "defillama_get_options_overview",
    description: "Get an options volume overview across all chains",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },
  {
    name: "defillama_get_options_overview_by_chain",
    description: "Get an options volume overview for a specific chain",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" }, ...overviewProperties },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_option_summary",
    description: "Get an options volume summary for a specific protocol",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "Options protocol slug" }, ...overviewProperties },
      required: ["protocol"]
    }
  },

  // -------------------------------------------------------------------------
  // Perps / Open interest
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_open_interest_overview",
    description: "Get a perpetuals open interest overview across all chains",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },

  // -------------------------------------------------------------------------
  // Fees / Revenue
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_fees_overview",
    description: "Get a fees and revenue overview across all chains",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },
  {
    name: "defillama_get_fees_overview_by_chain",
    description: "Get a fees and revenue overview for a specific chain",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" }, ...overviewProperties },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_fee_summary",
    description: "Get a fees and revenue summary for a specific protocol",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "Protocol slug, e.g. aave" }, ...overviewProperties },
      required: ["protocol"]
    }
  }
];

type handlerDictionary = Record<typeof tools[number]["name"], (input: any) => any>;

export const handlers: handlerDictionary = {
  // TVL
  "defillama_get_protocols": getProtocolsHandler,
  "defillama_get_protocol_tvl": getProtocolTvlHandler,
  "defillama_get_historical_chain_tvl": getHistoricalChainTvlHandler,
  "defillama_get_chain_tvl": getChainTvlHandler,
  "defillama_get_current_protocol_tvl": getCurrentProtocolTvlHandler,
  "defillama_get_chains": getChainsHandler,
  // Coins / Prices
  "defillama_get_token_prices": getTokenPricesHandler,
  "defillama_get_historical_prices": getHistoricalPricesHandler,
  "defillama_get_batch_historical_prices": getBatchHistoricalPricesHandler,
  "defillama_get_price_chart": getPriceChartHandler,
  "defillama_get_price_percentage_change": getPricePercentageChangeHandler,
  "defillama_get_first_prices": getFirstPricesHandler,
  "defillama_get_block": getBlockHandler,
  // Stablecoins
  "defillama_get_stablecoins": getStablecoinsHandler,
  "defillama_get_stablecoin_charts_all": getStablecoinChartsAllHandler,
  "defillama_get_stablecoin_charts_chain": getStablecoinChartsChainHandler,
  "defillama_get_stablecoin_data": getStablecoinDataHandler,
  "defillama_get_stablecoin_chains": getStablecoinChainsHandler,
  "defillama_get_stablecoin_prices": getStablecoinPricesHandler,
  // Yields
  "defillama_get_pools": getPoolsHandler,
  "defillama_get_pool_chart": getPoolChartHandler,
  // DEX / Options
  "defillama_get_dexs_overview": getDexsOverviewHandler,
  "defillama_get_dexs_overview_by_chain": getDexsOverviewByChainHandler,
  "defillama_get_dex_summary": getDexSummaryHandler,
  "defillama_get_options_overview": getOptionsOverviewHandler,
  "defillama_get_options_overview_by_chain": getOptionsOverviewByChainHandler,
  "defillama_get_option_summary": getOptionSummaryHandler,
  // Perps
  "defillama_get_open_interest_overview": getOpenInterestOverviewHandler,
  // Fees / Revenue
  "defillama_get_fees_overview": getFeesOverviewHandler,
  "defillama_get_fees_overview_by_chain": getFeesOverviewByChainHandler,
  "defillama_get_fee_summary": getFeeSummaryHandler
};
