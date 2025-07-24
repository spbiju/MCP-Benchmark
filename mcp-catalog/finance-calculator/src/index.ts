import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerEmiTool } from "./tools/emi.js";

// Optional: Define configuration schema to require configuration at connection time
export const configSchema = z.object({
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

export default function createStatelessServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Finance Calculator",
    version: "0.0.1",
  });

  // Register tools
  registerEmiTool(server);

  return server.server;
}
