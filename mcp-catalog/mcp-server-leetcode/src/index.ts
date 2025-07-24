#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LeetCodeService } from "./services/leetcode-service.js";
import { registerProblemTools } from "./tools/problem-tools.js";
import { registerUserTools } from "./tools/user-tools.js";
import { registerContestTools } from "./tools/contest-tools.js";
import { registerProblemResources } from "./resources/problem-resources.js";
import { registerUserResources } from "./resources/user-resources.js";

async function main() {
  // Create the MCP Server
  const server = new McpServer({
    name: "LeetCode MCP Server",
    version: "1.0.0"
  });

  // Initialize the LeetCode service
  const leetcodeService = new LeetCodeService();

  // Register tools
  registerProblemTools(server, leetcodeService);
  registerUserTools(server, leetcodeService);
  registerContestTools(server, leetcodeService);

  // Register resources
  registerProblemResources(server, leetcodeService);
  registerUserResources(server, leetcodeService);

  // Connect with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("LeetCode MCP Server running");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});