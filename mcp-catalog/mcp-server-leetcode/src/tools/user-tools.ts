import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeService } from "../services/leetcode-service.js";
import { z } from "zod";

export function registerUserTools(server: McpServer, leetcodeService: LeetCodeService) {
  // Get user profile
  server.tool(
    "get-user-profile",
    {
      username: z.string().describe("LeetCode username")
    },
    async ({ username }) => {
      try {
        const data = await leetcodeService.fetchUserProfile(username);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(data, null, 2)
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${errorMessage}` }],
          isError: true
        };
      }
    }
  );

  // Get user submissions
  server.tool(
    "get-user-submissions",
    {
      username: z.string().describe("LeetCode username"),
      limit: z.number().min(1).max(100).optional().default(20).describe("Maximum number of submissions to return")
    },
    async ({ username, limit }) => {
      try {
        const data = await leetcodeService.fetchUserSubmissions(username, limit);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(data, null, 2)
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${errorMessage}` }],
          isError: true
        };
      }
    }
  );
}