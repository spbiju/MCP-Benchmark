# Model Context Protocol Benchmarking Research

A comprehensive research project evaluating the performance, scalability, and reliability of Model Context Protocol (MCP) implementations across different environments and use cases.

## Overview

This repository contains benchmarking tools, datasets, and analysis for evaluating MCP server implementations. Our research focuses on measuring performance metrics, resource utilization, and protocol compliance across various MCP servers and client configurations.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Benchmarking Methodology](#benchmarking-methodology)
- [Results](#results)
- [Contributing](#contributing)
- [License](#license)
- [Citation](#citation)

## Features

- **Multi-Server Testing**: Benchmark multiple MCP server implementations simultaneously
- **Performance Metrics**: Measure response times, throughput, memory usage, and CPU utilization
- **Protocol Compliance**: Validate adherence to MCP specifications
- **Scalability Analysis**: Test performance under various load conditions
- **Resource Monitoring**: Track system resource consumption during benchmarks
- **Automated Reporting**: Generate detailed performance reports and visualizations
- **Configurable Workloads**: Support for custom test scenarios and datasets

## Installation

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher (for JavaScript MCP servers)
- Docker (optional, for containerized testing)
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-benchmarking-research.git
cd mcp-benchmarking-research
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install optional dependencies for extended functionality:
```bash
pip install -r requirements-dev.txt
```

## Usage

### Setting Up MCP Servers

This repository contains multiple MCP server implementations for benchmarking. Each server needs to be properly configured and launched before running benchmarks.

### Available MCP Servers

The following MCP servers are included in this repository:

- **Math MCP Server** (`./servers/math-mcp/`) - Mathematical operations and calculations
- **Chess MCP Server** (`./servers/chess-mcp/`) - Chess game management and analysis
- **File System MCP Server** (`./servers/filesystem-mcp/`) - File operations and management
- **Web Search MCP Server** (`./servers/web-search-mcp/`) - Web search capabilities

### Launching Individual MCP Servers

#### Math MCP Server

Navigate to the math server directory:
```bash
cd servers/math-mcp
```

Install dependencies:
```bash
npm install
```

Start the server:
```bash
npm start
```

The server will be available at `stdio://` transport or configure for TCP:
```bash
npm start -- --transport tcp --port 8080
```

#### Chess MCP Server

Navigate to the chess server directory:
```bash
cd servers/chess-mcp
```

Install dependencies:
```bash
npm install
```

Start the server:
```bash
npm start
```

#### Python-based MCP Servers

For Python-based servers (e.g., filesystem, web-search):

```bash
cd servers/[server-name]
pip install -r requirements.txt
python server.py
```

### Claude Desktop Integration

To connect any MCP server to Claude Desktop, add the following to your Claude Desktop configuration:

**For macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**For Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

#### Math MCP Server Configuration:
```json
{
  "mcpServers": {
    "math-mcp": {
      "command": "node",
      "args": ["path/to/servers/math-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

#### Chess MCP Server Configuration:
```json
{
  "mcpServers": {
    "chess-mcp": {
      "command": "node",
      "args": ["path/to/servers/chess-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

#### Python Server Configuration:
```json
{
  "mcpServers": {
    "filesystem-mcp": {
      "command": "python",
      "args": ["path/to/servers/filesystem-mcp/server.py"],
      "env": {}
    }
  }
}
```

### Running Multiple Servers

To run multiple MCP servers simultaneously for comprehensive benchmarking:

```json
{
  "mcpServers": {
    "math-mcp": {
      "command": "node",
      "args": ["path/to/servers/math-mcp/dist/index.js"],
      "env": {}
    },
    "chess-mcp": {
      "command": "node",
      "args": ["path/to/servers/chess-mcp/dist/index.js"],
      "env": {}
    },
    "filesystem-mcp": {
      "command": "python",
      "args": ["path/to/servers/filesystem-mcp/server.py"],
      "env": {}
    }
  }
}
```

### Verifying Server Connection

After configuration, restart Claude Desktop. You should see the MCP servers appear in the Claude interface. Test each server by trying their specific functions:

- **Math MCP**: Try mathematical operations
- **Chess MCP**: Start a chess game or analyze positions
- **Filesystem MCP**: List files or navigate directories

### Running Benchmarks

Once your servers are running, execute the benchmark suite:

#### Quick Start
```bash
python benchmark.py --config configs/default.yaml
```

#### Custom Benchmarks

Create a custom configuration file:

```yaml
# config/custom.yaml
servers:
  - name: "math-mcp"
    type: "node"
    path: "./servers/math-mcp"
    port: 8080
    transport: "stdio"
  - name: "chess-mcp"
    type: "node"
    path: "./servers/chess-mcp"
    port: 8081
    transport: "stdio"
  - name: "filesystem-mcp"
    type: "python"
    path: "./servers/filesystem-mcp"
    port: 8082
    transport: "stdio"

tests:
  - name: "basic_operations"
    duration: 60
    concurrent_clients: 10
  - name: "heavy_load"
    duration: 300
    concurrent_clients: 100

metrics:
  - response_time
  - throughput
  - memory_usage
  - cpu_usage
  - error_rate
```

Run with custom configuration:
```bash
python benchmark.py --config configs/custom.yaml --output results/
```

### Advanced Usage

#### Stress Testing
```bash
python benchmark.py --stress --max-clients 1000 --duration 600
```

#### Memory Profiling
```bash
python benchmark.py --profile-memory --detailed-metrics
```

#### Server-Specific Benchmarks
```bash
python benchmark.py --server math-mcp --test-suite mathematical-operations
python benchmark.py --server chess-mcp --test-suite game-analysis
```

#### Continuous Integration
```bash
python benchmark.py --ci --threshold-file thresholds.json
```

### Troubleshooting Server Launch

If you encounter issues launching servers:

1. **Check Node.js version**: Ensure Node.js 16+ is installed
2. **Python version**: Ensure Python 3.9+ is installed
3. **Dependencies**: Run `npm install` or `pip install -r requirements.txt`
4. **Port conflicts**: Check if ports are already in use
5. **Permissions**: Ensure proper file permissions for server directories

Common error solutions:
```bash
# Clear npm cache
npm cache clean --force

# Rebuild node modules
rm -rf node_modules package-lock.json
npm install

# Check Python path
which python
python --version
```

## Benchmarking Methodology

### Test Categories

1. **Latency Tests**: Measure response times for various MCP operations
2. **Throughput Tests**: Evaluate requests per second under different loads
3. **Resource Usage Tests**: Monitor memory, CPU, and network utilization
4. **Scalability Tests**: Assess performance degradation with increasing load
5. **Reliability Tests**: Test error handling and recovery mechanisms

### Metrics Collected

- **Response Time**: P50, P95, P99 percentiles
- **Throughput**: Requests per second
- **Resource Usage**: Memory consumption, CPU utilization
- **Error Rates**: Failed requests, timeout rates
- **Protocol Compliance**: Specification adherence score

### Test Environments

- Local development machines
- Cloud instances (AWS, GCP, Azure)
- Containerized environments (Docker, Kubernetes)
- Edge computing platforms

## Results

### Performance Comparison

Current benchmark results are available in the `results/` directory:

- `results/latest/`: Most recent benchmark runs
- `results/historical/`: Historical performance data
- `results/analysis/`: Detailed analysis and visualizations

### Key Findings

- Performance varies significantly between implementation languages
- Memory usage patterns differ based on server architecture
- Network latency has minimal impact on local MCP operations
- Concurrent client handling shows logarithmic scaling behavior

Detailed analysis and charts are available in our [Results Documentation](docs/results.md).

## Contributing

We welcome contributions to improve the benchmarking suite and expand test coverage.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-benchmark`
3. Install development dependencies: `pip install -r requirements-dev.txt`
4. Run tests: `pytest tests/`
5. Submit a pull request

### Adding New Benchmarks

1. Create test files in `tests/benchmarks/`
2. Follow the existing test structure and naming conventions
3. Add configuration options to `configs/schema.yaml`
4. Update documentation in `docs/`

### Code Style

- Follow PEP 8 for Python code
- Use type hints where appropriate
- Add docstrings for all public functions
- Run `black` and `flake8` before submitting

## Documentation

- [API Documentation](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Adding Custom Servers](docs/custom-servers.md)
- [Interpreting Results](docs/results.md)
- [Troubleshooting](docs/troubleshooting.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use this benchmarking suite in your research, please cite:

```bibtex
@software{mcp_benchmark_2025,
  title={Model Context Protocol Benchmarking Research},
  author={Your Name and Contributors},
  year={2025},
  url={https://github.com/yourusername/mcp-benchmarking-research},
  version={1.0.0}
}
```

## Acknowledgments

- Model Context Protocol specification contributors
- Open source MCP server implementations
- Performance testing community
- Research institutions and collaborators

## Contact

- **Maintainer**: Your Name (your.email@example.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/mcp-benchmarking-research/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mcp-benchmarking-research/discussions)

---

**Note**: This is an active research project. Results and methodologies may evolve as we gather more data and refine our testing approaches.
