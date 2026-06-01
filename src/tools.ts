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

// ---------------------------------------------------------------------------
// Reusable property fragments
// ---------------------------------------------------------------------------

// Responses are compacted by default; these optional controls fetch more.
const fullProp = {
  full: { type: "boolean", description: "Optional. Return the complete untrimmed response (default false)" }
};
const pointsProp = {
  points: { type: "number", description: "Optional. Max time-series data points to return (default 30)" }
};
const limitProp = {
  limit: { type: "number", description: "Optional. Max number of items to return" }
};
const includeTokensProp = {
  includeTokens: { type: "boolean", description: "Optional. Include token-level breakdowns (default false)" }
};

const dateTimeProp = (extra: string = "") => ({
  type: "string",
  description:
    `12-hour datetime string, e.g. "06/15/2024 03:30 PM" (UTC assumed), ` +
    `or with a timezone "06/15/2024 03:30 PM America/New_York" / "+05:30". ` +
    `UNIX seconds are also accepted.${extra}`
});

const coinsProperty = {
  type: "array",
  description: "Coin identifiers, e.g. \"ethereum:0xc02aaa...\" or \"coingecko:ethereum\"",
  items: { type: "string" }
};

// Query options shared by the DEX/options/fees overview & summary endpoints.
const overviewProperties = {
  dataType: {
    type: "string",
    description: "Optional. Metric to return (e.g. dailyVolume, dailyFees, dailyRevenue)"
  },
  excludeTotalDataChart: {
    type: "boolean",
    description: "Optional. Exclude the aggregated chart (default true; set false to include)"
  },
  excludeTotalDataChartBreakdown: {
    type: "boolean",
    description: "Optional. Exclude the broken-down chart (default true; set false to include)"
  },
  ...pointsProp,
  ...limitProp,
  ...fullProp
};

export const tools = [
  // -------------------------------------------------------------------------
  // TVL
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_protocols",
    description:
      "List all protocols tracked by DefiLlama with their TVL (trimmed to the top entries by TVL). " +
      "Example: { \"limit\": 50 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { ...limitProp, ...fullProp },
      required: []
    }
  },
  {
    name: "defillama_get_protocol_tvl",
    description:
      "Get the historical TVL breakdown for a specific protocol. Returns current per-chain TVL and a " +
      "downsampled TVL series by default. " +
      "Example: { \"protocol\": \"aave\", \"points\": 60 (optional), \"includeTokens\": false (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        protocol: { type: "string", description: "Protocol slug, e.g. aave" },
        ...pointsProp,
        ...includeTokensProp,
        ...fullProp
      },
      required: ["protocol"]
    }
  },
  {
    name: "defillama_get_historical_chain_tvl",
    description:
      "Get historical TVL across all chains combined (downsampled time series). " +
      "Example: { \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { ...pointsProp, ...fullProp },
      required: []
    }
  },
  {
    name: "defillama_get_chain_tvl",
    description:
      "Get historical TVL for a specific chain (downsampled time series). " +
      "Example: { \"chain\": \"ethereum\", \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        chain: { type: "string", description: "Chain name, e.g. ethereum" },
        ...pointsProp,
        ...fullProp
      },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_current_protocol_tvl",
    description:
      "Get the current TVL of a protocol as a single number. " +
      "Example: { \"protocol\": \"aave\" }",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "Protocol slug, e.g. aave" } },
      required: ["protocol"]
    }
  },
  {
    name: "defillama_get_chains",
    description:
      "Get the current TVL of every chain (trimmed to the top chains by TVL). " +
      "Example: { \"limit\": 50 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { ...limitProp, ...fullProp },
      required: []
    }
  },

  // -------------------------------------------------------------------------
  // Coins / Prices
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_token_prices",
    description:
      "Get current prices of tokens by identifier. " +
      "Example: { \"coins\": [\"ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2\", \"coingecko:bitcoin\"] }",
    inputSchema: {
      type: "object",
      properties: { coins: coinsProperty },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_historical_prices",
    description:
      "Get token prices at a given historical date/time. " +
      "Example: { \"coins\": [\"coingecko:ethereum\"], \"timestamp\": \"06/15/2024 03:30 PM\" }",
    inputSchema: {
      type: "object",
      properties: {
        coins: coinsProperty,
        timestamp: dateTimeProp()
      },
      required: ["coins", "timestamp"]
    }
  },
  {
    name: "defillama_get_batch_historical_prices",
    description:
      "Get historical prices for multiple coins at multiple dates/times. " +
      "Example: { \"coins\": { \"coingecko:ethereum\": [\"06/15/2024 03:30 PM\", \"01/01/2024 12:00 AM UTC\"] }, \"searchWidth\": \"4h\" (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        coins: {
          type: "object",
          description: "Map of coin identifier to an array of datetime strings (or UNIX seconds)",
          additionalProperties: { type: "array", items: { type: "string" } }
        },
        searchWidth: { type: "string", description: "Optional. Time range to search around each timestamp, e.g. 600 or 4h" }
      },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_price_chart",
    description:
      "Get a price chart (token prices over time) for the given coins. " +
      "Example: { \"coins\": [\"coingecko:ethereum\"], \"start\": \"01/01/2024 12:00 AM\" (optional), \"span\": 30 (optional), \"period\": \"2d\" (optional), \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        coins: coinsProperty,
        start: dateTimeProp(" Optional start of the range."),
        end: dateTimeProp(" Optional end of the range."),
        span: { type: "number", description: "Optional. Number of data points to return" },
        period: { type: "string", description: "Optional. Duration between data points, e.g. 2d, 1h" },
        searchWidth: { type: "string", description: "Optional. Time range to search around each point" },
        ...pointsProp,
        ...fullProp
      },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_price_percentage_change",
    description:
      "Get the percentage price change for the given coins over a period. " +
      "Example: { \"coins\": [\"coingecko:ethereum\"], \"timestamp\": \"06/15/2024 03:30 PM\" (optional), \"period\": \"3w\" (optional), \"lookForward\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        coins: coinsProperty,
        timestamp: dateTimeProp(" Optional reference time (defaults to now)."),
        lookForward: { type: "boolean", description: "Optional. Look forward from the timestamp instead of backward" },
        period: { type: "string", description: "Optional. Duration to measure the change over, e.g. 3w, 1d" }
      },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_first_prices",
    description:
      "Get the earliest recorded price for the given coins. " +
      "Example: { \"coins\": [\"coingecko:ethereum\"] }",
    inputSchema: {
      type: "object",
      properties: { coins: coinsProperty },
      required: ["coins"]
    }
  },
  {
    name: "defillama_get_block",
    description:
      "Get the block height closest to a date/time on a given chain. " +
      "Example: { \"chain\": \"ethereum\", \"timestamp\": \"06/15/2024 03:30 PM\" }",
    inputSchema: {
      type: "object",
      properties: {
        chain: { type: "string", description: "Chain name, e.g. ethereum" },
        timestamp: dateTimeProp()
      },
      required: ["chain", "timestamp"]
    }
  },

  // -------------------------------------------------------------------------
  // Stablecoins
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_stablecoins",
    description:
      "List stablecoins with their circulating amounts (trimmed to the largest by circulating supply). " +
      "Example: { \"includePrices\": true (optional), \"limit\": 50 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        includePrices: { type: "boolean", description: "Optional. Include current stablecoin prices" },
        ...limitProp,
        ...fullProp
      },
      required: []
    }
  },
  {
    name: "defillama_get_stablecoin_charts_all",
    description:
      "Get the historical market cap sum of all stablecoins (downsampled time series). " +
      "Example: { \"stablecoin\": 1 (optional), \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        stablecoin: { type: "number", description: "Optional. Stablecoin ID to filter by" },
        ...pointsProp,
        ...fullProp
      },
      required: []
    }
  },
  {
    name: "defillama_get_stablecoin_charts_chain",
    description:
      "Get the historical stablecoin market cap on a specific chain (downsampled time series). " +
      "Example: { \"chain\": \"ethereum\", \"stablecoin\": 1 (optional), \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        chain: { type: "string", description: "Chain name, e.g. ethereum" },
        stablecoin: { type: "number", description: "Optional. Stablecoin ID to filter by" },
        ...pointsProp,
        ...fullProp
      },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_stablecoin_data",
    description:
      "Get historical data for a specific stablecoin. " +
      "Example: { \"asset\": \"1\", \"includeTokens\": false (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        asset: { type: "string", description: "Stablecoin ID (e.g. 1) or name" },
        ...includeTokensProp,
        ...fullProp
      },
      required: ["asset"]
    }
  },
  {
    name: "defillama_get_stablecoin_chains",
    description:
      "Get current stablecoin totals for each chain. " +
      "Example: { \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { ...pointsProp, ...fullProp },
      required: []
    }
  },
  {
    name: "defillama_get_stablecoin_prices",
    description:
      "Get historical prices of stablecoins (downsampled time series). " +
      "Example: { \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { ...pointsProp, ...fullProp },
      required: []
    }
  },

  // -------------------------------------------------------------------------
  // Yields / APY
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_pools",
    description:
      "Get the latest TVL and APY for yield pools (trimmed to the largest by TVL). " +
      "Example: { \"limit\": 50 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { ...limitProp, ...fullProp },
      required: []
    }
  },
  {
    name: "defillama_get_pool_chart",
    description:
      "Get historical APY and TVL for a specific yield pool (downsampled time series). " +
      "Example: { \"pool\": \"747c1d2a-c668-4682-b9f9-296708a3dd90\", \"points\": 30 (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: {
        pool: { type: "string", description: "Pool ID (uuid from defillama_get_pools)" },
        ...pointsProp,
        ...fullProp
      },
      required: ["pool"]
    }
  },

  // -------------------------------------------------------------------------
  // DEX / Options volume
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_dexs_overview",
    description:
      "Get a DEX trading volume overview across all chains. Charts are excluded by default. " +
      "Example: { \"dataType\": \"dailyVolume\" (optional), \"limit\": 50 (optional), \"full\": false (optional) }",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },
  {
    name: "defillama_get_dexs_overview_by_chain",
    description:
      "Get a DEX trading volume overview for a specific chain. " +
      "Example: { \"chain\": \"ethereum\", \"dataType\": \"dailyVolume\" (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" }, ...overviewProperties },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_dex_summary",
    description:
      "Get a DEX trading volume summary for a specific protocol. " +
      "Example: { \"protocol\": \"uniswap\", \"dataType\": \"dailyVolume\" (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { protocol: { type: "string", description: "DEX protocol slug, e.g. uniswap" }, ...overviewProperties },
      required: ["protocol"]
    }
  },
  {
    name: "defillama_get_options_overview",
    description:
      "Get an options volume overview across all chains. " +
      "Example: { \"dataType\": \"dailyNotionalVolume\" (optional), \"full\": false (optional) }",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },
  {
    name: "defillama_get_options_overview_by_chain",
    description:
      "Get an options volume overview for a specific chain. " +
      "Example: { \"chain\": \"ethereum\", \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" }, ...overviewProperties },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_option_summary",
    description:
      "Get an options volume summary for a specific protocol. " +
      "Example: { \"protocol\": \"lyra\", \"full\": false (optional) }",
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
    description:
      "Get a perpetuals open interest overview across all chains. " +
      "Example: { \"full\": false (optional) }",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },

  // -------------------------------------------------------------------------
  // Fees / Revenue
  // -------------------------------------------------------------------------
  {
    name: "defillama_get_fees_overview",
    description:
      "Get a fees and revenue overview across all chains. " +
      "Example: { \"dataType\": \"dailyFees\" (optional), \"limit\": 50 (optional), \"full\": false (optional) }",
    inputSchema: { type: "object", properties: { ...overviewProperties }, required: [] }
  },
  {
    name: "defillama_get_fees_overview_by_chain",
    description:
      "Get a fees and revenue overview for a specific chain. " +
      "Example: { \"chain\": \"ethereum\", \"dataType\": \"dailyRevenue\" (optional), \"full\": false (optional) }",
    inputSchema: {
      type: "object",
      properties: { chain: { type: "string", description: "Chain name, e.g. ethereum" }, ...overviewProperties },
      required: ["chain"]
    }
  },
  {
    name: "defillama_get_fee_summary",
    description:
      "Get a fees and revenue summary for a specific protocol. " +
      "Example: { \"protocol\": \"aave\", \"dataType\": \"dailyFees\" (optional), \"full\": false (optional) }",
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
