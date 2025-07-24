# DexPaprika MCP Server

A Model Context Protocol (MCP) server that provides on-demand access to DexPaprika's cryptocurrency and DEX data API. Built specifically for AI assistants like Claude to programmatically fetch real-time token, pool, and DEX data with zero configuration.

## TL;DR

```bash
# Install globally
npm install -g dexpaprika-mcp

# Start the server
dexpaprika-mcp

# Or run directly without installation
npx dexpaprika-mcp
```

DexPaprika MCP connects Claude to live DEX data across multiple blockchains. No API keys required. [Installation](#installation) | [Configuration](#claude-desktop-integration) | [API Reference](https://docs.dexpaprika.com/introduction)

## 🚨 Version 1.1.0 Update Notice

**Breaking Change**: The global `/pools` endpoint has been removed. If you're upgrading from v1.0.x, please see the [Migration Guide](#migration-from-v10x-to-v110) below.

## What Can You Build?

- **Token Analysis Tools**: Track price movements, liquidity depth changes, and volume patterns
- **DEX Comparisons**: Analyze fee structures, volume, and available pools across different DEXes
- **Liquidity Pool Analytics**: Monitor TVL changes, impermanent loss calculations, and price impact assessments
- **Market Analysis**: Cross-chain token comparisons, volume trends, and trading activity metrics
- **Portfolio Trackers**: Real-time value tracking, historical performance analysis, yield opportunities
- **Technical Analysis**: Perform advanced technical analysis using historical OHLCV data, including trend identification, pattern recognition, and indicator calculations

## Installation

### Installing via Smithery

To install DexPaprika for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@coinpaprika/dexpaprika-mcp):

```bash
npx -y @smithery/cli install @coinpaprika/dexpaprika-mcp --client claude
```

### Manual Installation
```bash
# Install globally (recommended for regular use)
npm install -g dexpaprika-mcp

# Verify installation
dexpaprika-mcp --version

# Start the server
dexpaprika-mcp
```

The server runs on port 8010 by default. You'll see `MCP server is running at http://localhost:8010` when successfully started.

## Video Tutorial

Watch our step-by-step tutorial on setting up and using the DexPaprika MCP server:

[![DexPaprika MCP Tutorial](https://img.youtube.com/vi/rIxFn2PhtvI/0.jpg)](https://www.youtube.com/watch?v=rIxFn2PhtvI)

## Claude Desktop Integration

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application\ Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dexpaprika": {
      "command": "npx",
      "args": ["dexpaprika-mcp"]
    }
  }
}
```

After restarting Claude Desktop, the DexPaprika tools will be available to Claude automatically.

## Migration from v1.0.x to v1.1.0

### ⚠️ Breaking Changes

The global `getTopPools` function has been **removed** due to API deprecation. 

### Migration Steps

**Before (v1.0.x):**
```javascript
// This will no longer work
getTopPools({ page: 0, limit: 10, sort: 'desc', orderBy: 'volume_usd' })
```

**After (v1.1.0):**
```javascript
// Use network-specific queries instead
getNetworkPools({ network: 'ethereum', page: 0, limit: 10, sort: 'desc', orderBy: 'volume_usd' })
getNetworkPools({ network: 'solana', page: 0, limit: 10, sort: 'desc', orderBy: 'volume_usd' })

// To query multiple networks, call getNetworkPools for each network
// Or use the search function for cross-network searches
```

### Benefits of the New Approach

- **Better Performance**: Network-specific queries are faster and more efficient
- **More Relevant Results**: Get pools that are actually relevant to your use case
- **Improved Scalability**: Better suited for handling large amounts of data across networks

## Technical Capabilities

The MCP server exposes these specific endpoints Claude can access:

### Network Operations

| Function | Description | Example |
|----------|-------------|---------|
| `getNetworks` | Retrieves all supported blockchain networks and metadata | `{"id": "ethereum", "name": "Ethereum", "symbol": "ETH", ...}` |
| `getNetworkDexes` | Lists DEXes available on a specific network | `{"dexes": [{"id": "uniswap_v3", "name": "Uniswap V3", ...}]}` |

### Pool Operations

| Function | Description | Required Parameters | Example Usage |
|----------|-------------|---------------------|--------------|
| `getNetworkPools` | **[PRIMARY]** Gets top pools on a specific network | `network`, `limit` | Get Solana's highest liquidity pools | 
| `getDexPools` | Gets top pools for a specific DEX | `network`, `dex` | List pools on Uniswap V3 |
| `getPoolDetails` | Gets detailed pool metrics | `network`, `poolAddress` | Complete metrics for USDC/ETH pool |
| `getPoolOHLCV` | Retrieves time-series price data for various analytical purposes (technical analysis, ML models, backtesting) | `network`, `poolAddress`, `start`, `interval` | 7-day hourly candles for SOL/USDC |
| `getPoolTransactions` | Lists recent transactions in a pool | `network`, `poolAddress` | Last 20 swaps in a specific pool |

### Token Operations

| Function | Description | Required Parameters | Output Fields |
|----------|-------------|---------------------|--------------|
| `getTokenDetails` | Gets comprehensive token data | `network`, `tokenAddress` | `price_usd`, `volume_24h`, `liquidity_usd`, etc. |
| `getTokenPools` | Lists pools containing a token | `network`, `tokenAddress` | Returns all pools with liquidity metrics |
| `search` | Finds tokens, pools, DEXes by name/id | `query` | Multi-entity search results |

### Example Usage

```javascript
// With Claude, get details about a specific token:
const solanaJupToken = await getTokenDetails({
  network: "solana", 
  tokenAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
});

// Find all pools for a specific token with volume sorting:
const jupiterPools = await getTokenPools({
  network: "solana", 
  tokenAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  orderBy: "volume_usd",
  limit: 5
});

// Get top pools on Ethereum (v1.1.0 approach):
const ethereumPools = await getNetworkPools({
  network: "ethereum",
  orderBy: "volume_usd",
  limit: 10
});

// Get historical price data for various analytical purposes (technical analysis, ML models, backtesting):
const ohlcvData = await getPoolOHLCV({
  network: "ethereum",
  poolAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // ETH/USDC on Uniswap V3
  start: "2023-01-01",
  interval: "1d",
  limit: 30
});
```

## Sample Prompts for Claude

When working with Claude, try these specific technical queries (updated for v1.1.0):

- "Analyze the JUP token on Solana. Fetch price, volume, and top liquidity pools."
- "Compare trading volume between Uniswap V3 and SushiSwap on Ethereum."
- "Get the 7-day OHLCV data for SOL/USDC on Raydium and plot a price chart."
- "Find the top 5 pools by liquidity on Fantom network and analyze their fee structures."
- "Get recent transactions for the ETH/USDT pool on Uniswap and analyze buy vs sell pressure."
- "Show me the top 10 pools on Ethereum by 24h volume using getNetworkPools."
- "Search for all pools containing the ARB token and rank them by volume."
- "Retrieve OHLCV data for BTC/USDT to analyze volatility patterns and build a price prediction model."
- "First get all available networks, then show me the top pools on each major network."

## Rate Limits & Performance

- **Free Tier Limits**: 60 requests per minute
- **Response Time**: 100-500ms for most endpoints (network dependent)
- **Data Freshness**: Pool and token data updated every 15-30s
- **Error Handling**: 429 status codes indicate rate limiting
- **OHLCV Data Availability**: Historical data typically available from token/pool creation date

## Troubleshooting

**Common Issues:**

- **Rate limiting**: If receiving 429 errors, reduce request frequency
- **Missing data**: Some newer tokens/pools may have incomplete historical data
- **Timeout errors**: Large data requests may take longer, consider pagination
- **Network errors**: Check network connectivity, the service requires internet access
- **OHLCV limitations**: Maximum range between start and end dates is 1 year; use pagination for longer timeframes

**Migration Issues:**

- **"getTopPools not found"**: This function has been removed. Use `getNetworkPools` instead with a specific network parameter
- **"410 Gone" errors**: You're using a deprecated endpoint. Check the error message for guidance on the correct endpoint to use

## Development

```bash
# Clone the repository
git clone https://github.com/coinpaprika/dexpaprika-mcp.git
cd dexpaprika-mcp

# Install dependencies
npm install

# Run with auto-restart on code changes
npm run watch

# Build for production
npm run build

# Run tests
npm test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and migration guides.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Resources

- [DexPaprika API Documentation](https://docs.dexpaprika.com/introduction)
- [Model Context Protocol Specification](https://github.com/anthropics/anthropic-cookbook/blob/main/mcp/README.md)
- [DexPaprika](https://dexpaprika.com) - Comprehensive onchain analytics market data
- [CoinPaprika](https://coinpaprika.com) - Comprehensive cryptocurrency market data
