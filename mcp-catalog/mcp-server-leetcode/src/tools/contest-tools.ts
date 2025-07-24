import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeService } from "../services/leetcode-service.js";
import { z } from "zod";

export function registerContestTools(server: McpServer, leetcodeService: LeetCodeService) {
  // Get contest details
  server.tool(
    "get-contest-details",
    {
      contestSlug: z.string().describe("The URL slug of the contest")
    },
    async ({ contestSlug }) => {
      try {
        const data = await leetcodeService.fetchContestDetails(contestSlug);
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

  // Get user contest ranking
  server.tool(
    "get-user-contest-ranking",
    {
      username: z.string().describe("LeetCode username")
    },
    async ({ username }) => {
      try {
        const data = await leetcodeService.fetchUserContestRanking(username);
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