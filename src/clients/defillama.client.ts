/**
 * DefiLlama API Client
 * Provides methods to interact with the free (keyless) DefiLlama API.
 *
 * DefiLlama splits its free API across a few category-specific hosts. The
 * canonical routing is:
 *   - TVL, DEX/options volume, fees/revenue, open interest -> api.llama.fi
 *   - Coins / prices / blocks                              -> coins.llama.fi
 *   - Stablecoins                                          -> stablecoins.llama.fi
 *   - Yields / pools                                       -> yields.llama.fi
 */

export const DEFILLAMA_HOSTS = {
  api: "https://api.llama.fi",
  coins: "https://coins.llama.fi",
  stablecoins: "https://stablecoins.llama.fi",
  yields: "https://yields.llama.fi",
} as const;

export type QueryValue = string | number | boolean | undefined;
export type QueryParams = Record<string, QueryValue>;

/** Common query options for the DEX/options/fees overview & summary endpoints. */
export interface OverviewOptions {
  excludeTotalDataChart?: boolean;
  excludeTotalDataChartBreakdown?: boolean;
  dataType?: string;
}

// Protocol interfaces
export interface Protocol {
  id: string;
  name: string;
  address?: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  tvl: number;
  change_1h?: number;
  change_1d?: number;
  change_7d?: number;
  category: string;
  chains: string[];
  module: string;
  twitter?: string;
  audit_links?: string[];
  audit_note?: string;
  gecko_id?: string;
  cmcId?: string;
  chainTvls: Record<string, number>;
}

// Protocol TVL interfaces
export interface TvlItem {
  date: number;
  totalLiquidityUSD: number;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
}

export interface ProtocolTvl {
  name: string;
  address?: string;
  symbol: string;
  url: string;
  description: string;
  /** Current TVL (number) or an aggregate historical series, depending on the endpoint shape. */
  tvl: number | TvlItem[];
  tokensInUsd?: Array<{
    date: number;
    tokens: Record<string, number>;
  }>;
  tokens?: Record<string, TokenBalance> | Array<{ date: number; tokens: Record<string, number> }>;
  /** Current TVL per chain (present on the live API). */
  currentChainTvls?: Record<string, number>;
  /** Per-chain TVL: flat current numbers, or historical {tvl,tokens,tokensInUsd} objects. */
  chainTvls: Record<string, number | { tvl?: TvlItem[]; tokens?: unknown; tokensInUsd?: unknown }>;
  tvlPriceChange?: Record<string, number>;
  tvlList?: TvlItem[];
}

// Chain TVL interfaces
export interface ChainTvlItem {
  date: number;
  totalLiquidityUSD: number;
  tvl?: number;
  totalLiquidityETH?: number;
}

export interface Chain {
  gecko_id: string | null;
  tvl: number;
  tokenSymbol: string | null;
  cmcId: string | null;
  name: string;
  chainId: number | null;
}

// Token price interfaces
export interface TokenPrice {
  price: number;
  symbol: string;
  timestamp: number;
  confidence: number;
  decimals?: number;
}

export interface TokenPricesResponse {
  coins: Record<string, TokenPrice>;
}

// Stablecoin interfaces
export interface StablecoinCirculating {
  peggedUSD?: number;
  peggedEUR?: number;
  peggedVAR?: number;
}

export interface StablecoinAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  circulating: StablecoinCirculating;
  chainCirculating: Record<string, StablecoinCirculating>;
}

export interface StablecoinsResponse {
  peggedAssets: StablecoinAsset[];
}

export interface StablecoinData extends StablecoinAsset {
  pegType: string;
  priceSource: string;
  pegMechanism: string;
  circulating7dAgo: StablecoinCirculating;
  circulatingPrevDay: StablecoinCirculating;
  circulatingPrevWeek: StablecoinCirculating;
  delisted: boolean;
}

export class DefiLlamaClient {
  /**
   * Makes a GET request to one of the DefiLlama hosts.
   */
  protected async request<T>(host: string, path: string, query?: QueryParams): Promise<T> {
    let url = `${host}${path}`;

    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DefiLlama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json() as T;
  }

  /** Joins coin identifiers into the comma-separated form DefiLlama expects. */
  private joinCoins(coins: string[]): string {
    if (!coins || coins.length === 0) {
      throw new Error("At least one coin is required");
    }
    return coins.join(",");
  }

  // ---------------------------------------------------------------------------
  // TVL
  // ---------------------------------------------------------------------------

  /** GET /protocols — list all protocols. */
  async getProtocols(): Promise<Protocol[]> {
    return this.request<Protocol[]>(DEFILLAMA_HOSTS.api, "/protocols");
  }

  /** GET /protocol/{protocol} — full TVL breakdown for a protocol. */
  async getProtocolTvl(protocol: string): Promise<ProtocolTvl> {
    if (!protocol) {
      throw new Error("Protocol name is required");
    }
    return this.request<ProtocolTvl>(DEFILLAMA_HOSTS.api, `/protocol/${protocol}`);
  }

  /** GET /v2/historicalChainTvl — historical TVL across all chains. */
  async getHistoricalChainTvl(): Promise<ChainTvlItem[]> {
    return this.request<ChainTvlItem[]>(DEFILLAMA_HOSTS.api, "/v2/historicalChainTvl");
  }

  /** GET /v2/historicalChainTvl/{chain} — historical TVL for one chain. */
  async getChainTvl(chain: string): Promise<ChainTvlItem[]> {
    if (!chain) {
      throw new Error("Chain name is required");
    }

    const data = await this.request<ChainTvlItem[]>(DEFILLAMA_HOSTS.api, `/v2/historicalChainTvl/${chain}`);

    // Normalize so each item exposes totalLiquidityUSD.
    if (Array.isArray(data)) {
      return data.map(item => {
        if (!item.totalLiquidityUSD && (item.tvl || item.totalLiquidityETH)) {
          return {
            ...item,
            totalLiquidityUSD: item.tvl || item.totalLiquidityETH || 0,
          };
        }
        return item;
      });
    }

    return data;
  }

  /** GET /tvl/{protocol} — current TVL of a protocol as a single number. */
  async getCurrentProtocolTvl(protocol: string): Promise<number> {
    if (!protocol) {
      throw new Error("Protocol name is required");
    }
    return this.request<number>(DEFILLAMA_HOSTS.api, `/tvl/${protocol}`);
  }

  /** GET /v2/chains — current TVL of all chains. */
  async getChains(): Promise<Chain[]> {
    return this.request<Chain[]>(DEFILLAMA_HOSTS.api, "/v2/chains");
  }

  // ---------------------------------------------------------------------------
  // Coins / Prices
  // ---------------------------------------------------------------------------

  /** GET /prices/current/{coins} — current prices for the given coins. */
  async getTokenPrices(coins: string[]): Promise<TokenPricesResponse> {
    return this.request<TokenPricesResponse>(DEFILLAMA_HOSTS.coins, `/prices/current/${this.joinCoins(coins)}`);
  }

  /** GET /prices/historical/{timestamp}/{coins} — prices at a timestamp. */
  async getHistoricalPrices(coins: string[], timestamp: number): Promise<TokenPricesResponse> {
    const coinsParam = this.joinCoins(coins);
    if (!timestamp) {
      throw new Error("Timestamp is required");
    }
    return this.request<TokenPricesResponse>(DEFILLAMA_HOSTS.coins, `/prices/historical/${timestamp}/${coinsParam}`);
  }

  /**
   * GET /batchHistorical — historical prices for many coins at many timestamps.
   * @param coins Map of coin identifier to an array of UNIX timestamps.
   */
  async getBatchHistoricalPrices(coins: Record<string, number[]>, searchWidth?: string): Promise<TokenPricesResponse> {
    if (!coins || Object.keys(coins).length === 0) {
      throw new Error("At least one coin is required");
    }
    return this.request<TokenPricesResponse>(DEFILLAMA_HOSTS.coins, "/batchHistorical", {
      coins: JSON.stringify(coins),
      searchWidth,
    });
  }

  /** GET /chart/{coins} — price chart for the given coins. */
  async getPriceChart(
    coins: string[],
    options: { start?: number; end?: number; span?: number; period?: string; searchWidth?: string } = {}
  ): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.coins, `/chart/${this.joinCoins(coins)}`, { ...options });
  }

  /** GET /percentage/{coins} — percentage price change for the given coins. */
  async getPricePercentageChange(
    coins: string[],
    options: { timestamp?: number; lookForward?: boolean; period?: string } = {}
  ): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.coins, `/percentage/${this.joinCoins(coins)}`, { ...options });
  }

  /** GET /prices/first/{coins} — earliest recorded price for the given coins. */
  async getFirstPrices(coins: string[]): Promise<TokenPricesResponse> {
    return this.request<TokenPricesResponse>(DEFILLAMA_HOSTS.coins, `/prices/first/${this.joinCoins(coins)}`);
  }

  /** GET /block/{chain}/{timestamp} — closest block to a timestamp on a chain. */
  async getBlock(chain: string, timestamp: number): Promise<{ height: number; timestamp: number }> {
    if (!chain) {
      throw new Error("Chain name is required");
    }
    if (!timestamp) {
      throw new Error("Timestamp is required");
    }
    return this.request<{ height: number; timestamp: number }>(DEFILLAMA_HOSTS.coins, `/block/${chain}/${timestamp}`);
  }

  // ---------------------------------------------------------------------------
  // Stablecoins
  // ---------------------------------------------------------------------------

  /** GET /stablecoins — list all stablecoins with circulating amounts. */
  async getStablecoins(includePrices?: boolean): Promise<StablecoinsResponse> {
    return this.request<StablecoinsResponse>(DEFILLAMA_HOSTS.stablecoins, "/stablecoins", { includePrices });
  }

  /** GET /stablecoincharts/all — historical mcap sum of all stablecoins. */
  async getStablecoinChartsAll(stablecoin?: number | string): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.stablecoins, "/stablecoincharts/all", { stablecoin });
  }

  /** GET /stablecoincharts/{chain} — historical mcap of stablecoins on a chain. */
  async getStablecoinChartsChain(chain: string, stablecoin?: number | string): Promise<unknown> {
    if (!chain) {
      throw new Error("Chain name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.stablecoins, `/stablecoincharts/${chain}`, { stablecoin });
  }

  /** GET /stablecoin/{asset} — historical data for a single stablecoin. */
  async getStablecoinData(asset: string): Promise<StablecoinData> {
    if (!asset) {
      throw new Error("Asset name is required");
    }
    return this.request<StablecoinData>(DEFILLAMA_HOSTS.stablecoins, `/stablecoin/${asset}`);
  }

  /** GET /stablecoinchains — current stablecoin totals per chain. */
  async getStablecoinChains(): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.stablecoins, "/stablecoinchains");
  }

  /** GET /stablecoinprices — historical stablecoin prices. */
  async getStablecoinPrices(): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.stablecoins, "/stablecoinprices");
  }

  // ---------------------------------------------------------------------------
  // Yields / APY
  // ---------------------------------------------------------------------------

  /** GET /pools — latest data for all yield pools. */
  async getPools(): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.yields, "/pools");
  }

  /** GET /chart/{pool} — historical APY and TVL for a pool. */
  async getPoolChart(pool: string): Promise<unknown> {
    if (!pool) {
      throw new Error("Pool ID is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.yields, `/chart/${pool}`);
  }

  // ---------------------------------------------------------------------------
  // DEX / Options volume
  // ---------------------------------------------------------------------------

  /** GET /overview/dexs — DEX volume overview across all chains. */
  async getDexsOverview(options: OverviewOptions = {}): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.api, "/overview/dexs", { ...options });
  }

  /** GET /overview/dexs/{chain} — DEX volume overview for a chain. */
  async getDexsOverviewByChain(chain: string, options: OverviewOptions = {}): Promise<unknown> {
    if (!chain) {
      throw new Error("Chain name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.api, `/overview/dexs/${chain}`, { ...options });
  }

  /** GET /summary/dexs/{protocol} — DEX volume summary for a protocol. */
  async getDexSummary(protocol: string, options: OverviewOptions = {}): Promise<unknown> {
    if (!protocol) {
      throw new Error("Protocol name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.api, `/summary/dexs/${protocol}`, { ...options });
  }

  /** GET /overview/options — options volume overview across all chains. */
  async getOptionsOverview(options: OverviewOptions = {}): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.api, "/overview/options", { ...options });
  }

  /** GET /overview/options/{chain} — options volume overview for a chain. */
  async getOptionsOverviewByChain(chain: string, options: OverviewOptions = {}): Promise<unknown> {
    if (!chain) {
      throw new Error("Chain name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.api, `/overview/options/${chain}`, { ...options });
  }

  /** GET /summary/options/{protocol} — options volume summary for a protocol. */
  async getOptionSummary(protocol: string, options: OverviewOptions = {}): Promise<unknown> {
    if (!protocol) {
      throw new Error("Protocol name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.api, `/summary/options/${protocol}`, { ...options });
  }

  // ---------------------------------------------------------------------------
  // Perps / Open interest
  // ---------------------------------------------------------------------------

  /** GET /overview/open-interest — perps open interest overview. */
  async getOpenInterestOverview(options: OverviewOptions = {}): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.api, "/overview/open-interest", { ...options });
  }

  // ---------------------------------------------------------------------------
  // Fees / Revenue
  // ---------------------------------------------------------------------------

  /** GET /overview/fees — fees/revenue overview across all chains. */
  async getFeesOverview(options: OverviewOptions = {}): Promise<unknown> {
    return this.request<unknown>(DEFILLAMA_HOSTS.api, "/overview/fees", { ...options });
  }

  /** GET /overview/fees/{chain} — fees/revenue overview for a chain. */
  async getFeesOverviewByChain(chain: string, options: OverviewOptions = {}): Promise<unknown> {
    if (!chain) {
      throw new Error("Chain name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.api, `/overview/fees/${chain}`, { ...options });
  }

  /** GET /summary/fees/{protocol} — fees/revenue summary for a protocol. */
  async getFeeSummary(protocol: string, options: OverviewOptions = {}): Promise<unknown> {
    if (!protocol) {
      throw new Error("Protocol name is required");
    }
    return this.request<unknown>(DEFILLAMA_HOSTS.api, `/summary/fees/${protocol}`, { ...options });
  }
}

// Export a singleton instance for use throughout the application
export const defiLlamaClient = new DefiLlamaClient();
