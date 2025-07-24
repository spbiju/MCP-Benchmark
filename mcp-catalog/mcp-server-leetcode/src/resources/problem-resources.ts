import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeService } from "../services/leetcode-service.js";

export function registerProblemResources(server: McpServer, leetcodeService: LeetCodeService) {
  // Daily challenge resource
  server.resource(
    "daily-challenge",
    "leetcode://daily-challenge",
    async (uri) => {
      try {
        const data = await leetcodeService.fetchDailyChallenge();
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch daily challenge: ${errorMessage}`);
      }
    }
  );

  // Problem details resource
  server.resource(
    "problem-details",
    new ResourceTemplate("leetcode://problem/{titleSlug}", { list: undefined }),
    async (uri, variables) => {
      const titleSlug = variables.titleSlug as string;
      try {
        const data = await leetcodeService.fetchProblem(titleSlug);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch problem details: ${errorMessage}`);
      }
    }
  );

  // Problems list resource
  server.resource(
    "problems-list",
    new ResourceTemplate("leetcode://problems{?tags,difficulty,limit,skip}", { list: undefined }),
    async (uri, variables) => {
      const tags = variables.tags as string | undefined;
      const difficulty = variables.difficulty as string | undefined;
      const limit = variables.limit as string | undefined;
      const skip = variables.skip as string | undefined;
      try {
        const data = await leetcodeService.searchProblems(
          tags as string | undefined, 
          difficulty as string | undefined, 
          parseInt(limit as string || "20"),
          parseInt(skip as string || "0")
        );
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch problems list: ${errorMessage}`);
      }
    }
  );
}