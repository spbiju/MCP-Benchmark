# MCP Catalog

A comprehensive collection of Model Context Protocol (MCP) servers providing various functionalities from scientific computing to entertainment and productivity tools.

## Quick Start

### 1. Set up API Keys

First, configure your API keys in the `api_key` file:

```bash
# Edit the api_key file with your actual API keys
nano api_key

# Source the API keys to set environment variables
source api_key
```

The `api_key` file contains the following keys that you need to configure:

- `WEATHER_API_KEY`: Get from [WeatherAPI](https://www.weatherapi.com/)
- `NPS_API_KEY`: Get from [National Park Service](https://www.nps.gov/subjects/developer/)
- `ALPHAGENOME_API_KEY`: For biomedical research (optional)
- `CBIO_TOKEN`: For cBioPortal access (optional)
- `NASA_API_KEY`: Get from [NASA API](https://api.nasa.gov/)

### 2. Set up Python Virtual Environment

Create and activate a Python virtual environment for the MCP catalog:

```bash
# Create virtual environment
python3 -m venv mcp_catalog_servers

# Activate virtual environment
source mcp_catalog_servers/bin/activate
```

### 3. Install Prerequisites and Dependencies

Make the installation script executable and run it:

```bash
# Make install script executable
chmod +x install.sh
# if we run into errors for permissions like pnpm us curl -fsSL https://get.pnpm.io/install.sh | sh -
#the source ~/.zshrc

# Run the installation script
./install.sh
```

The installation script will:
- Install Node.js (≥18) and Python (≥3.10)
- Install package managers (npm, uv, pnpm, yarn)
- Install system dependencies
- Build TypeScript servers
- Install Python dependencies for all servers

## Available MCP Servers

The catalog includes 37 MCP servers organized by category:

### 🔬 Scientific & Research
- **NASA Data**: Access NASA's APIs for space data
- **Scientific Computing**: Linear algebra and mathematical computations
- **Paper Search**: Search academic papers across multiple databases
- **Medical Calculator**: Medical calculations and assessments
- **BioMCP**: Biomedical research and clinical trial data

### 🎮 Gaming & Entertainment
- **Game Trends**: Gaming industry trends and statistics
- **OP.GG Gaming**: Gaming performance analytics
- **EVE Online**: EVE Online market data
- **Movie Recommender**: Movie recommendations and information
- **MLB Baseball**: Baseball statistics and data

### 💼 Business & Finance
- **Finance Calculator**: Financial calculations and tools
- **Car Price Evaluator**: Vehicle pricing evaluation
- **OKX Exchange**: Cryptocurrency exchange data
- **DEX Paprika**: Decentralized exchange information

### 🏨 Travel & Location
- **National Parks**: US National Parks information
- **Airbnb Search**: Airbnb listings and search
- **Hotel MCP**: Hotel and travel services
- **Weather Data**: Weather information and forecasts

### 🛠️ Utilities & Tools
- **Unit Converter**: Convert between different units
- **Math MCP**: Mathematical calculations
- **Context7**: Context management tools
- **WhoIs Lookup**: Domain and IP information
- **Huge Icons**: Icon search and management

### 🌐 Web & Social
- **Wikipedia**: Wikipedia content access
- **Reddit**: Reddit data and posts
- **YouTube MCP Server**: YouTube content information
- **GitHub Trending**: GitHub trending repositories

### 🎨 Content & Media
- **Metropolitan Museum**: Met Museum collection access
- **FruityVice**: Fruit nutrition information
- **Bibliomantic**: I Ching divination system

### 💻 Development
- **LeetCode**: Programming problems and solutions
- **NixOS**: NixOS package management
- **Hugging Face**: AI model hub access

### 🔍 Intelligence & Investigation
- **OSINT Intelligence**: Open source intelligence tools
- **Sherlock Investigation**: Username investigation across platforms
- **Call for Papers**: Academic conference calls

## Running Individual Servers

Use the commands from `commands.json` to run specific servers:

```bash
# Example: Run the Weather Data server
python mcp-catalog/weather_mcp/server.py

# Example: Run the Math MCP server
node mcp-catalog/math-mcp/build/index.js
```

## Testing with MCP Inspector

Test any server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

## Project Structure

```
mcp-catalog/
├── README.md                 # This file
├── api_key                   # API keys configuration
├── requirements.txt          # Python dependencies
├── commands.json            # Server commands and environment variables
├── install.sh               # Installation script
├── bibliomantic-mcp-server/ # I Ching divination
├── biomcp/                  # Biomedical research
├── call-for-papers-mcp/     # Academic conferences
├── car-price-mcp-main/      # Vehicle pricing
├── context7-mcp/            # Context management
├── dexpaprika-mcp/          # DEX information
├── erickwendel-contributions-mcp/ # Developer contributions
├── eve-online-mcp/          # EVE Online data
├── finance-calculator/      # Financial tools
├── fruityvice-mcp/         # Fruit nutrition
├── game-trends-mcp/        # Gaming trends
├── hugeicons-mcp-server/   # Icon search
├── huggingface-mcp-server/ # AI models
├── jinko-mcp/              # Hotel services
├── math-mcp/               # Mathematics
├── mcp-github-trending/    # GitHub trends
├── mcp-nixos/              # NixOS packages
├── mcp-osint-server/       # OSINT tools
├── mcp-reddit/             # Reddit data
├── mcp-server-airbnb/      # Airbnb search
├── mcp-server-leetcode/    # Programming problems
├── mcp-server-nationalparks/ # National parks
├── mcp-units/              # Unit conversion
├── medcalc/                # Medical calculations
├── metmuseum-mcp/          # Museum data
├── mlb-mcp/                # Baseball stats
├── movie-recommender-mcp/  # Movie recommendations
├── my-youtube-mcp-server/  # YouTube data
├── nasa-mcp/               # NASA APIs
├── okx-mcp/                # Cryptocurrency
├── opgg-mcp/               # Gaming analytics
├── paper-search-mcp/       # Academic papers
├── scientific_computation_mcp/ # Scientific computing
├── sherlock_mcp/           # Username investigation
├── weather_mcp/            # Weather data
├── whodis-mcp-server/      # Domain lookup
└── wikipedia-mcp/          # Wikipedia access
```

## Troubleshooting

### Common Issues

1. **Permission Issues**: Make sure `install.sh` is executable with `chmod +x install.sh`

2. **API Key Errors**: Ensure you've configured the required API keys in the `api_key` file and sourced it

3. **Node.js Version**: Some servers require Node.js ≥18. Update if necessary

4. **Python Version**: Servers require Python ≥3.10. Update if necessary

5. **Missing Dependencies**: Run `./install.sh` again to ensure all dependencies are installed

### Getting Help

- Check individual server README files for specific setup instructions
- Use the MCP Inspector to test server functionality
- Ensure all environment variables are properly set

## Contributing

When adding new MCP servers:
1. Place the server in its own subdirectory
2. Update `commands.json` with the new server entry
3. Add any new dependencies to `requirements.txt`
4. Update the installation script if needed
5. Document any required API keys in the `api_key` file

## License

Each MCP server maintains its own license. Please check individual server directories for licensing information.