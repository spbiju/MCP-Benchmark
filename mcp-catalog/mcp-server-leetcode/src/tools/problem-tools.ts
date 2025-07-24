import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeService } from "../services/leetcode-service.js";
import { z } from "zod";

export function registerProblemTools(server: McpServer, leetcodeService: LeetCodeService) {
  // Get daily challenge
  server.tool(
    "get-daily-challenge",
    {},
    async () => {
      try {
        const data = await leetcodeService.fetchDailyChallenge();
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

  // Get problem details
  server.tool(
    "get-problem",
    {
      titleSlug: z.string().describe("The URL slug of the problem (e.g., 'two-sum')")
    },
    async ({ titleSlug }) => {
      try {
        const data = await leetcodeService.fetchProblem(titleSlug);
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

  // Search problems
  server.tool(
    "search-problems",
    {
      tags: z.string().optional().describe("Tags to filter by, separated by '+' (e.g., 'array+dynamic-programming')"),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().describe("Difficulty level"),
      limit: z.number().min(1).max(100).optional().default(20).describe("Maximum number of problems to return"),
      skip: z.number().optional().default(0).describe("Number of problems to skip")
    },
    async ({ tags, difficulty, limit, skip }) => {
      try {
        const data = await leetcodeService.searchProblems(tags, difficulty, limit, skip);
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