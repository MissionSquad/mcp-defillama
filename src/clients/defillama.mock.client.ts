/**
 * Mock DefiLlama API Client for testing
 * Provides mock implementations of the DefiLlama API methods
 */

import {
  DefiLlamaClient,
  Protocol,
  ProtocolTvl,
  ChainTvlItem,
  TokenPricesResponse,
  StablecoinsResponse,
  StablecoinData,
  QueryParams
} from "./defillama.client.js";

export class MockDefiLlamaClient extends DefiLlamaClient {
  /**
   * Generic stub for every endpoint that isn't given a bespoke mock below.
   * Keeps test mode (TEST_MODE=true) fully offline for the newer endpoints.
   */
  protected async request<T>(host: string, path: string, _query?: QueryParams): Promise<T> {
    return { mock: true, host, path } as unknown as T;
  }

  /**
   * Mock implementation of getProtocols
   */
  async getProtocols(): Promise<Protocol[]> {
    return [
      { 
        id: "1", 
        name: "Mock Protocol 1", 
        symbol: "MP1",
        tvl: 1000000000,
        chain: "Ethereum",
        category: "Lending",
        change_1d: 0.05,
        change_7d: -0.02,
        chains: ["Ethereum"],
        module: "mock-module",
        url: "https://mockprotocol1.com",
        description: "A mock lending protocol",
        logo: "https://mockprotocol1.com/logo.png",
        chainTvls: {
          ethereum: 1000000000
        }
      },
      { 
        id: "2", 
        name: "Mock Protocol 2", 
        symbol: "MP2",
        tvl: 500000000,
        chain: "Polygon",
        category: "DEX",
        change_1d: -0.01,
        change_7d: 0.03,
        chains: ["Polygon"],
        module: "mock-module",
        url: "https://mockprotocol2.com",
        description: "A mock DEX protocol",
        logo: "https://mockprotocol2.com/logo.png",
        chainTvls: {
          polygon: 500000000
        }
      }
    ];
  }

  /**
   * Mock implementation of getProtocolTvl
   */
  async getProtocolTvl(protocol: string): Promise<ProtocolTvl> {
    if (!protocol) {
      throw new Error("Protocol name is required");
    }
    
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    
    return {
      name: protocol,
      symbol: "MOCK",
      url: "https://mock-protocol.com",
      description: "A mock protocol for testing",
      tvl: 1000000000,
      tokensInUsd: [
        {
          date: Math.floor(currentDate.getTime() / 1000),
          tokens: {
            "0x1234": 800000000,
            "0x5678": 200000000
          }
        }
      ],
      tokens: {
        "0x1234": { symbol: "MOCK1", balance: "800000" },
        "0x5678": { symbol: "MOCK2", balance: "200000" }
      },
      chainTvls: {
        ethereum: 800000000,
        polygon: 200000000
      },
      tvlPriceChange: {
        total: 0.05,
        ethereum: 0.04,
        polygon: 0.06
      },
      tvlList: [
        {
          date: Math.floor(yesterday.getTime() / 1000),
          totalLiquidityUSD: 950000000
        },
        {
          date: Math.floor(currentDate.getTime() / 1000),
          totalLiquidityUSD: 1000000000
        }
      ]
    };
  }

  /**
   * Mock implementation of getChainTvl
   */
  async getChainTvl(chain: string): Promise<ChainTvlItem[]> {
    if (!chain) {
      throw new Error("Chain name is required");
    }
    
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    
    return [
      { 
        date: Math.floor(twoDaysAgo.getTime() / 1000), 
        totalLiquidityUSD: 1000000000 
      },
      { 
        date: Math.floor(yesterday.getTime() / 1000), 
        totalLiquidityUSD: 1100000000 
      },
      { 
        date: Math.floor(currentDate.getTime() / 1000), 
        totalLiquidityUSD: 1050000000 
      }
    ];
  }

  /**
   * Mock implementation of getTokenPrices
   */
  async getTokenPrices(coins: string[]): Promise<TokenPricesResponse> {
    if (!coins || coins.length === 0) {
      throw new Error("At least one coin is required");
    }
    
    const result: TokenPricesResponse = { coins: {} };
    
    coins.forEach(coin => {
      result.coins[coin] = {
        price: 100 + Math.random() * 900,
        symbol: coin.split(':').pop() || 'MOCK',
        timestamp: Math.floor(Date.now() / 1000),
        confidence: 0.99
      };
    });
    
    return result;
  }

  /**
   * Mock implementation of getHistoricalPrices
   */
  async getHistoricalPrices(coins: string[], timestamp: number): Promise<TokenPricesResponse> {
    if (!coins || coins.length === 0) {
      throw new Error("At least one coin is required");
    }
    if (!timestamp) {
      throw new Error("Timestamp is required");
    }
    
    const result: TokenPricesResponse = { coins: {} };
    
    coins.forEach(coin => {
      result.coins[coin] = {
        price: 100 + Math.random() * 900,
        symbol: coin.split(':').pop() || 'MOCK',
        timestamp: timestamp,
        confidence: 0.95
      };
    });
    
    return result;
  }

  /**
   * Mock implementation of getStablecoins
   */
  async getStablecoins(): Promise<StablecoinsResponse> {
    return {
      peggedAssets: [
        {
          id: "1",
          name: "Mock USD",
          symbol: "MUSD",
          price: 1.0,
          circulating: {
            peggedUSD: 1000000000
          },
          chainCirculating: {
            ethereum: {
              peggedUSD: 800000000
            },
            polygon: {
              peggedUSD: 200000000
            }
          }
        },
        {
          id: "2",
          name: "Mock EUR",
          symbol: "MEUR",
          price: 1.1,
          circulating: {
            peggedEUR: 500000000
          },
          chainCirculating: {
            ethereum: {
              peggedEUR: 300000000
            },
            polygon: {
              peggedEUR: 200000000
            }
          }
        }
      ]
    };
  }

  /**
   * Mock implementation of getStablecoinData
   */
  async getStablecoinData(asset: string): Promise<StablecoinData> {
    if (!asset) {
      throw new Error("Asset name is required");
    }
    
    const currentDate = new Date();
    
    return {
      id: asset,
      name: `Mock ${asset}`,
      symbol: asset.toUpperCase(),
      price: 1.0,
      circulating: {
        peggedUSD: 1000000000
      },
      chainCirculating: {
        ethereum: {
          peggedUSD: 800000000
        },
        polygon: {
          peggedUSD: 200000000
        }
      },
      pegType: "peggedUSD",
      priceSource: "mock-oracle",
      pegMechanism: "algorithmic",
      circulating7dAgo: {
        peggedUSD: 950000000
      },
      circulatingPrevDay: {
        peggedUSD: 980000000
      },
      circulatingPrevWeek: {
        peggedUSD: 950000000
      },
      delisted: false
    };
  }
}

// Export a singleton instance for use throughout the application
export const mockDefiLlamaClient = new MockDefiLlamaClient(); 