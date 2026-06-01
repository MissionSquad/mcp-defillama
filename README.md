# MCP Server for DefiLlama

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that gives MCP-compatible clients (Claude Desktop, etc.) access to DeFi data via the [DefiLlama](https://defillama.com) API. It covers all 31 endpoints of DefiLlama's free, keyless API — protocol and chain TVL, token prices, stablecoins, yield pools, DEX and options volume, perps open interest, and fees/revenue.

No API key is required. The server routes each request to DefiLlama's category-specific hosts (`api.llama.fi`, `coins.llama.fi`, `stablecoins.llama.fi`, `yields.llama.fi`) automatically.

Published on npm as [`@missionsquad/mcp-defillama`](https://www.npmjs.com/package/@missionsquad/mcp-defillama).

## Tools

The server exposes all **31** endpoints of the free (keyless) DefiLlama API as MCP tools. Required parameters are marked accordingly; everything else is optional.

### TVL

- `defillama_get_protocols` — List all protocols and their TVL.
- `defillama_get_protocol_tvl` — Full historical TVL breakdown for a protocol.
  - `protocol` (string, required): protocol slug, e.g. `aave`.
- `defillama_get_historical_chain_tvl` — Historical TVL across all chains combined.
- `defillama_get_chain_tvl` — Historical TVL for a specific chain.
  - `chain` (string, required): chain name, e.g. `ethereum`.
- `defillama_get_current_protocol_tvl` — Current TVL of a protocol as a single number.
  - `protocol` (string, required).
- `defillama_get_chains` — Current TVL of every chain.

### Coins / Prices

- `defillama_get_token_prices` — Current prices of tokens.
  - `coins` (string[], required): e.g. `["ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]`.
- `defillama_get_historical_prices` — Token prices at a historical timestamp.
  - `coins` (string[], required), `timestamp` (number, required): UNIX seconds.
- `defillama_get_batch_historical_prices` — Prices for many coins at many timestamps.
  - `coins` (object, required): map of coin id → array of timestamps. `searchWidth` (string, optional).
- `defillama_get_price_chart` — Price chart over time for the given coins.
  - `coins` (string[], required); optional `start`, `end`, `span`, `period`, `searchWidth`.
- `defillama_get_price_percentage_change` — Percentage price change over a period.
  - `coins` (string[], required); optional `timestamp`, `lookForward`, `period`.
- `defillama_get_first_prices` — Earliest recorded price for the given coins.
  - `coins` (string[], required).
- `defillama_get_block` — Block height closest to a timestamp on a chain.
  - `chain` (string, required), `timestamp` (number, required).

### Stablecoins

- `defillama_get_stablecoins` — List all stablecoins with circulating amounts.
  - `includePrices` (boolean, optional).
- `defillama_get_stablecoin_charts_all` — Historical market cap sum of all stablecoins.
  - `stablecoin` (number, optional): filter by stablecoin ID.
- `defillama_get_stablecoin_charts_chain` — Historical stablecoin market cap on a chain.
  - `chain` (string, required), `stablecoin` (number, optional).
- `defillama_get_stablecoin_data` — Historical data for a specific stablecoin.
  - `asset` (string, required): stablecoin ID or name.
- `defillama_get_stablecoin_chains` — Current stablecoin totals per chain.
- `defillama_get_stablecoin_prices` — Historical stablecoin prices.

### Yields / APY

- `defillama_get_pools` — Latest TVL and APY for all yield pools.
- `defillama_get_pool_chart` — Historical APY and TVL for a pool.
  - `pool` (string, required): pool ID (uuid from `defillama_get_pools`).

### DEX / Options volume

- `defillama_get_dexs_overview` — DEX volume overview across all chains.
- `defillama_get_dexs_overview_by_chain` — DEX volume overview for a chain. `chain` (string, required).
- `defillama_get_dex_summary` — DEX volume summary for a protocol. `protocol` (string, required).
- `defillama_get_options_overview` — Options volume overview across all chains.
- `defillama_get_options_overview_by_chain` — Options volume overview for a chain. `chain` (string, required).
- `defillama_get_option_summary` — Options volume summary for a protocol. `protocol` (string, required).

The overview/summary tools above (and the fees tools below) also accept optional `excludeTotalDataChart` (boolean), `excludeTotalDataChartBreakdown` (boolean), and `dataType` (string, e.g. `dailyVolume`, `dailyFees`, `dailyRevenue`).

### Perps / Open interest

- `defillama_get_open_interest_overview` — Perpetuals open interest overview.

### Fees / Revenue

- `defillama_get_fees_overview` — Fees and revenue overview across all chains.
- `defillama_get_fees_overview_by_chain` — Fees and revenue overview for a chain. `chain` (string, required).
- `defillama_get_fee_summary` — Fees and revenue summary for a protocol. `protocol` (string, required).

## Requirements

- Node.js v18 or higher (the server relies on the global `fetch` API).

## Usage

### Option 1: Using npx (recommended)

Run the server directly without installing it:

```bash
npx @missionsquad/mcp-defillama
```

This downloads and executes the server from npm. The server communicates over stdio, so it is normally launched by an MCP client rather than run by hand.

### Option 2: From source

```bash
git clone https://github.com/missionsquad/mcp-defillama.git
cd mcp-defillama
yarn install
yarn build
yarn start
```

## Configuring an MCP client

To use this server with Claude Desktop, open **Settings → Developer → Edit Config** and add the server to your `mcpServers` configuration.

Using npx:

```json
{
  "mcpServers": {
    "defillama": {
      "command": "npx",
      "args": ["@missionsquad/mcp-defillama"]
    }
  }
}
```

Using a local build:

```json
{
  "mcpServers": {
    "defillama": {
      "command": "node",
      "args": ["/path/to/mcp-defillama/dist/index.js"]
    }
  }
}
```

## Development

```bash
yarn install     # install dependencies
yarn dev         # compile in watch mode
yarn build       # compile to dist/
yarn test        # build and run the test suite (mocked client)
yarn test:no-mock  # build and run the suite against the live DefiLlama API
```

The test suite uses a mock DefiLlama client by default. The client used at runtime is selected by the `TEST_MODE` environment variable: when `TEST_MODE=true`, a mock client returning canned data is used; otherwise the real DefiLlama API is called.

## License

[MIT](./LICENSE)
