#!/usr/bin/env python3
"""
MCP Catalog Server Testing Script
**Prerequisites: run in mcp_catalog_servers virtual environment**
This script tests all MCP servers in the catalog by:
1. Reading server configurations from ../mcp-catalog/commands.json
2. Starting each server with stdio communication
3. Sending MCP protocol messages to test basic functionality
4. Generating a summary report of working/failing servers
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mcp_server_test.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ServerTestResult:
    """Result of testing a single MCP server"""
    name: str
    command: str
    env_vars: List[str]
    status: str  # 'success', 'failed', 'timeout', 'error'
    error_message: Optional[str] = None
    response_time: Optional[float] = None
    tools_count: Optional[int] = None
    tools_list: Optional[List[str]] = None

class MCPServerTester:
    """Test MCP servers using stdio communication"""
    
    def __init__(self, catalog_path: str = "../mcp-catalog", timeout: int = 30):
        self.catalog_path = Path(catalog_path)
        self.commands_file = self.catalog_path / "commands.json"
        self.api_key_file = self.catalog_path / "api_key"
        self.timeout = timeout
        self.results: List[ServerTestResult] = []
        
    def load_commands(self) -> Dict[str, Dict[str, Any]]:
        """Load server commands from commands.json"""
        try:
            with open(self.commands_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Commands file not found: {self.commands_file}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in commands file: {e}")
            sys.exit(1)
    
    def load_environment_variables(self) -> Dict[str, str]:
        """Load environment variables from api_key file"""
        env_vars = {}
        if self.api_key_file.exists():
            try:
                with open(self.api_key_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and '=' in line and not line.startswith('#'):
                            key, value = line.split('=', 1)
                            env_vars[key.strip()] = value.strip()
                logger.info(f"Loaded {len(env_vars)} environment variables")
            except Exception as e:
                logger.warning(f"Error loading environment variables: {e}")
        return env_vars
    
    def create_mcp_message(self, method: str, params: Dict[str, Any], id: int = 1) -> str:
        """Create a JSON-RPC 2.0 message for MCP protocol"""
        message = {
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        }
        return json.dumps(message) + "\n"
    
    def parse_command(self, cmd: str) -> Tuple[str, List[str]]:
        """Parse command string into executable and arguments"""
        parts = cmd.split()
        if not parts:
            raise ValueError("Empty command")
        
        executable = parts[0]
        args = parts[1:]
        
        # Handle special cases - convert relative paths to absolute
        if executable == "python" and len(args) > 0:
            if args[0].startswith("../mcp-catalog/"):
                args[0] = str(Path(args[0]).resolve())
            elif args[0].startswith("mcp-catalog/"):
                args[0] = str(self.catalog_path.parent / args[0])
        elif executable == "node" and len(args) > 0:
            if args[0].startswith("../mcp-catalog/"):
                args[0] = str(Path(args[0]).resolve())
            elif args[0].startswith("mcp-catalog/"):
                args[0] = str(self.catalog_path.parent / args[0])
        elif executable == "python" and "-m" in args:
            # Handle python -m module syntax
            module_idx = args.index("-m") + 1
            if module_idx < len(args):
                if args[module_idx].startswith("../mcp-catalog/"):
                    args[module_idx] = str(Path(args[module_idx]).resolve())
                elif args[module_idx].startswith("mcp-catalog/"):
                    args[module_idx] = str(self.catalog_path.parent / args[module_idx])
        
        return executable, args
    
    async def test_server(self, name: str, config: Dict[str, Any], env_vars: Dict[str, str]) -> ServerTestResult:
        """Test a single MCP server"""
        logger.info(f"Testing server: {name}")
        
        start_time = time.time()
        result = ServerTestResult(
            name=name,
            command=config['cmd'],
            env_vars=config.get('env', []),
            status='pending'
        )
        
        try:
            # Parse command
            executable, args = self.parse_command(config['cmd'])
            
            # Set up environment
            env = os.environ.copy()
            env.update(env_vars)
            
            # Add required environment variables for this server
            for env_var in config.get('env', []):
                if env_var not in env:
                    logger.warning(f"Missing required environment variable: {env_var}")
                    result.status = 'failed'
                    result.error_message = f"Missing environment variable: {env_var}"
                    return result
            
            # Start server process
            logger.debug(f"Starting: {executable} {' '.join(args)}")
            
            # Set working directory based on command type
            if "python -m biomcp" in config['cmd']:
                # For BioMCP module import, run from the biomcp/src directory
                cwd = Path("../mcp-catalog/biomcp/src").resolve()
            elif "python -m mcp_server_github_trending" in config['cmd']:
                # For GitHub Trending module import, run from the src directory
                cwd = Path("../mcp-catalog/mcp-github-trending/src").resolve()
            elif "npx @smithery/cli dev" in config['cmd']:
                # For Finance Calculator, run from its own directory due to relative imports
                cwd = Path("../mcp-catalog/finance-calculator").resolve()
            elif "wikipedia-mcp/wikipedia_mcp/server.py" in config['cmd']:
                # For Wikipedia MCP, run from its own directory for module imports
                cwd = Path("../mcp-catalog/wikipedia-mcp").resolve()
            elif "paper-search-mcp/paper_search_mcp/server.py" in config['cmd']:
                # For Paper Search MCP, run from its own directory for module imports
                cwd = Path("../mcp-catalog/paper-search-mcp").resolve()
            elif "sherlock_mcp/main.py" in config['cmd']:
                # For Sherlock MCP, run from its own directory for module imports
                cwd = Path("../mcp-catalog/sherlock_mcp").resolve()
            elif "mcp-reddit/src/mcp_reddit/reddit_fetcher.py" in config['cmd']:
                # For Reddit MCP, run from its own directory for module imports
                cwd = Path("../mcp-catalog/mcp-reddit").resolve()
            elif "npx tsx src/index.ts" in config['cmd'] and "erickwendel" in name:
                # For erickwendel-contributions-mcp, run from its own directory for module imports
                cwd = Path("../mcp-catalog/erickwendel-contributions-mcp").resolve()
            elif "uv run python" in config['cmd']:
                # For uv commands, run from the specific server directory
                server_dir = None
                for part in args:
                    if part.startswith("../mcp-catalog/") and part.endswith(".py"):
                        server_dir = Path(part).parent.resolve()
                        break
                if server_dir and server_dir.exists():
                    cwd = server_dir
                else:
                    cwd = Path("..").resolve()  # MCP-Benchmark root
            else:
                cwd = Path("..").resolve()  # MCP-Benchmark root for other commands
            
            process = await asyncio.create_subprocess_exec(
                executable, *args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                cwd=cwd
            )
            
            # Send initialize message
            init_message = self.create_mcp_message("initialize", {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "roots": {"listChanged": True},
                    "sampling": {}
                },
                "clientInfo": {
                    "name": "mcp-catalog-tester",
                    "version": "1.0.0"
                }
            })
            
            # Send message to server
            process.stdin.write(init_message.encode())
            await process.stdin.drain()
            
            # Wait for response with timeout
            try:
                stdout_data, stderr_data = await asyncio.wait_for(
                    process.communicate(), timeout=self.timeout
                )
                
                stdout_text = stdout_data.decode('utf-8', errors='ignore')
                stderr_text = stderr_data.decode('utf-8', errors='ignore')
                
                # Check if we got a valid response
                if stdout_text.strip():
                    try:
                        # Try to parse JSON response
                        lines = stdout_text.strip().split('\n')
                        for line in lines:
                            if line.strip():
                                response = json.loads(line)
                                if 'result' in response:
                                    result.status = 'success'
                                    result.response_time = time.time() - start_time
                                    
                                    # Send tools/list request to get available tools
                                    await self.get_server_tools(process, result)
                                    break
                    except json.JSONDecodeError:
                        logger.debug(f"Non-JSON response from {name}: {stdout_text[:200]}")
                        result.status = 'failed'
                        result.error_message = f"Invalid JSON response. Got: {stdout_text[:100]}"
                else:
                    result.status = 'failed'
                    result.error_message = f"No response. stderr: {stderr_text[:200]}"
                
            except asyncio.TimeoutError:
                result.status = 'timeout'
                result.error_message = f"Server did not respond within {self.timeout} seconds"
                process.kill()
                await process.wait()
            
        except FileNotFoundError:
            result.status = 'failed'
            result.error_message = f"Executable not found: {executable}"
        except Exception as e:
            result.status = 'error'
            result.error_message = str(e)
        
        result.response_time = time.time() - start_time
        logger.info(f"Server {name}: {result.status} ({result.response_time:.2f}s)")
        
        return result
    
    async def get_server_tools(self, process: asyncio.subprocess.Process, result: ServerTestResult) -> None:
        """Get list of tools from server"""
        try:
            # Send tools/list request
            tools_message = self.create_mcp_message("tools/list", {}, id=2)
            process.stdin.write(tools_message.encode())
            await process.stdin.drain()
            
            # Read response (with short timeout)
            try:
                stdout_data, _ = await asyncio.wait_for(
                    process.communicate(), timeout=5
                )
                stdout_text = stdout_data.decode('utf-8', errors='ignore')
                
                lines = stdout_text.strip().split('\n')
                for line in lines:
                    if line.strip():
                        try:
                            response = json.loads(line)
                            if 'result' in response and 'tools' in response['result']:
                                tools = response['result']['tools']
                                result.tools_count = len(tools)
                                result.tools_list = [tool.get('name', 'unknown') for tool in tools]
                                break
                        except json.JSONDecodeError:
                            continue
            except asyncio.TimeoutError:
                logger.debug(f"Timeout getting tools for {result.name}")
                
        except Exception as e:
            logger.debug(f"Error getting tools for {result.name}: {e}")
    
    async def test_all_servers(self) -> List[ServerTestResult]:
        """Test all servers in the catalog"""
        commands = self.load_commands()
        env_vars = self.load_environment_variables()
        
        logger.info(f"Testing {len(commands)} MCP servers...")
        
        # Test servers concurrently (but limit concurrency to avoid resource issues)
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent tests
        
        async def test_with_semaphore(name: str, config: Dict[str, Any]) -> ServerTestResult:
            async with semaphore:
                return await self.test_server(name, config, env_vars)
        
        tasks = [test_with_semaphore(name, config) for name, config in commands.items()]
        self.results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions in results
        final_results = []
        for i, result in enumerate(self.results):
            if isinstance(result, Exception):
                name = list(commands.keys())[i]
                final_results.append(ServerTestResult(
                    name=name,
                    command=commands[name]['cmd'],
                    env_vars=commands[name].get('env', []),
                    status='error',
                    error_message=str(result)
                ))
            else:
                final_results.append(result)
        
        self.results = final_results
        return self.results
    
    def generate_summary_report(self) -> str:
        """Generate a summary report of test results"""
        if not self.results:
            return "No test results available."
        
        total = len(self.results)
        success = len([r for r in self.results if r.status == 'success'])
        failed = len([r for r in self.results if r.status == 'failed'])
        timeout = len([r for r in self.results if r.status == 'timeout'])
        error = len([r for r in self.results if r.status == 'error'])
        
        report = []
        report.append("=" * 80)
        report.append("MCP CATALOG SERVER TEST SUMMARY")
        report.append("=" * 80)
        report.append(f"Total servers tested: {total}")
        report.append(f"✅ Successful: {success} ({success/total*100:.1f}%)")
        report.append(f"❌ Failed: {failed} ({failed/total*100:.1f}%)")
        report.append(f"⏱️  Timeout: {timeout} ({timeout/total*100:.1f}%)")
        report.append(f"🔥 Error: {error} ({error/total*100:.1f}%)")
        report.append("")
        
        # Successful servers
        if success > 0:
            report.append("🟢 WORKING SERVERS:")
            report.append("-" * 40)
            for result in sorted([r for r in self.results if r.status == 'success'], 
                               key=lambda x: x.name):
                tools_info = ""
                if result.tools_count is not None:
                    tools_info = f" ({result.tools_count} tools)"
                report.append(f"  ✅ {result.name}{tools_info}")
                if result.tools_list:
                    tools_str = ", ".join(result.tools_list[:3])
                    if len(result.tools_list) > 3:
                        tools_str += f" and {len(result.tools_list)-3} more"
                    report.append(f"     Tools: {tools_str}")
            report.append("")
        
        # Failed servers
        failing_servers = [r for r in self.results if r.status != 'success']
        if failing_servers:
            report.append("🔴 FAILING SERVERS:")
            report.append("-" * 40)
            for result in sorted(failing_servers, key=lambda x: x.name):
                status_emoji = {
                    'failed': '❌',
                    'timeout': '⏱️',
                    'error': '🔥'
                }.get(result.status, '❓')
                
                report.append(f"  {status_emoji} {result.name}")
                report.append(f"     Command: {result.command}")
                if result.env_vars:
                    report.append(f"     Env vars: {', '.join(result.env_vars)}")
                if result.error_message:
                    report.append(f"     Error: {result.error_message}")
                report.append("")
        
        # Performance statistics
        successful_results = [r for r in self.results if r.status == 'success' and r.response_time]
        if successful_results:
            avg_response = sum(r.response_time for r in successful_results) / len(successful_results)
            report.append("📊 PERFORMANCE STATISTICS:")
            report.append("-" * 40)
            report.append(f"Average response time: {avg_response:.2f}s")
            
            fastest = min(successful_results, key=lambda x: x.response_time)
            slowest = max(successful_results, key=lambda x: x.response_time)
            report.append(f"Fastest server: {fastest.name} ({fastest.response_time:.2f}s)")
            report.append(f"Slowest server: {slowest.name} ({slowest.response_time:.2f}s)")
            report.append("")
        
        report.append("=" * 80)
        
        return "\n".join(report)
    
    def save_detailed_report(self, filename: str = "mcp_test_detailed_report.json"):
        """Save detailed test results to JSON file"""
        detailed_results = []
        for result in self.results:
            detailed_results.append({
                'name': result.name,
                'command': result.command,
                'env_vars': result.env_vars,
                'status': result.status,
                'error_message': result.error_message,
                'response_time': result.response_time,
                'tools_count': result.tools_count,
                'tools_list': result.tools_list
            })
        
        with open(filename, 'w') as f:
            json.dump(detailed_results, f, indent=2)
        
        logger.info(f"Detailed report saved to {filename}")

async def main():
    """Main function"""
    print("🚀 Starting MCP Catalog Server Testing...")
    
    # Check if we're in the right directory
    if not Path("../mcp-catalog").exists():
        print("❌ Error: mcp-catalog directory not found!")
        print("Please run this script from the mcp-bench directory.")
        sys.exit(1)
    
    tester = MCPServerTester()
    
    try:
        # Run tests
        results = await tester.test_all_servers()
        
        # Generate and display summary
        summary = tester.generate_summary_report()
        print(summary)
        
        # Save detailed report
        tester.save_detailed_report()
        
        # Write summary to file
        with open("mcp_test_summary.txt", "w") as f:
            f.write(summary)
        
        print("\n📄 Reports saved:")
        print("  - mcp_test_summary.txt (summary)")
        print("  - mcp_test_detailed_report.json (detailed)")
        print("  - mcp_server_test.log (logs)")
        
    except KeyboardInterrupt:
        print("\n🛑 Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())