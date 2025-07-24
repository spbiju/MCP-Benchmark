import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeService } from "../services/leetcode-service.js";

export function registerUserResources(server: McpServer, leetcodeService: LeetCodeService) {
  // User profile resource
  server.resource(
    "user-profile",
    new ResourceTemplate("leetcode://user/{username}/profile", { list: undefined }),
    async (uri, variables) => {
      const username = variables.username as string;
      try {
        const data = await leetcodeService.fetchUserProfile(username);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch user profile: ${errorMessage}`);
      }
    }
  );

  // User submissions resource
  server.resource(
    "user-submissions",
    new ResourceTemplate("leetcode://user/{username}/submissions{?limit}", { list: undefined }),
    async (uri, variables) => {
      const username = variables.username as string;
      const limit = variables.limit as string | undefined;
      try {
        const data = await leetcodeService.fetchUserSubmissions(
          username, 
          parseInt(limit as string || "20")
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
        throw new Error(`Failed to fetch user submissions: ${errorMessage}`);
      }
    }
  );

  // User contest ranking resource
  server.resource(
    "user-contest-ranking",
    new ResourceTemplate("leetcode://user/{username}/contest-ranking", { list: undefined }),
    async (uri, variables) => {
      const username = variables.username as string;
      try {
        const data = await leetcodeService.fetchUserContestRanking(username);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch user contest ranking: ${errorMessage}`);
      }
    }
  );
}