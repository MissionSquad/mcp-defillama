# MCP Server for DefiLlama

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that gives MCP-compatible clients (Claude Desktop, etc.) access to DeFi data via the [DefiLlama](https://defillama.com) API. It can retrieve protocol TVL, chain TVL, token prices, and stablecoin information.

Published on npm as [`@missionsquad/mcp-defillama`](https://www.npmjs.com/package/@missionsquad/mcp-defillama).

## Tools

The server exposes the following tools:

### Protocol Data

- `defillama_get_protocols` — List all protocols tracked by DefiLlama.
- `defillama_get_protocol_tvl` — Get TVL data for a specific protocol.
  - `protocol` (string, required): protocol slug, e.g. `aave`.

### Chain Data

- `defillama_get_chain_tvl` — Get historical TVL data for a specific chain.
  - `chain` (string, required): chain name, e.g. `ethereum`.

### Token Data

- `defillama_get_token_prices` — Get current prices of tokens.
  - `coins` (string[], required): coin identifiers, e.g. `["ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]`.
- `defillama_get_historical_prices` — Get historical prices of tokens at a point in time.
  - `coins` (string[], required): coin identifiers.
  - `timestamp` (number, required): UNIX timestamp (seconds).

### Stablecoin Data

- `defillama_get_stablecoins` — List all stablecoins tracked by DefiLlama.
- `defillama_get_stablecoin_data` — Get data for a specific stablecoin.
  - `asset` (string, required): stablecoin asset id/name.

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
yarn install     # or: npm install
yarn build       # or: npm run build
yarn start       # or: npm start
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
