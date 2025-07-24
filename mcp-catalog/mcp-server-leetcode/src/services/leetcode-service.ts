import axios, { AxiosInstance } from "axios";
import {
  userProfileQuery,
  userSubmissionsQuery,
  dailyChallengeQuery,
  problemDetailsQuery,
  searchProblemsQuery,
  contestDetailsQuery,
  userContestRankingQuery
} from "../graphql/queries.js";

export class LeetCodeService {
  private readonly API_URL = "https://leetcode.com/graphql";
  private readonly http: AxiosInstance;
  
  constructor() {
    this.http = axios.create({
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com"
      }
    });
  }

  /**
   * Execute a GraphQL query against the LeetCode API
   */
  private async executeQuery(query: string, variables: Record<string, any> = {}) {
    try {
      const response = await this.http.post(this.API_URL, {
        query,
        variables
      });
      
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }
      
      return response.data.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const axiosError = error as { response: { status: number, data?: any } };
        throw new Error(`API Error: ${axiosError.response.status} - ${axiosError.response.data?.message || JSON.stringify(axiosError.response.data)}`);
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error("Network Error: No response received from LeetCode API");
      }
      // 如果是其他类型的错误，转换为Error类型
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  /**
   * Fetch user profile data
   */
  async fetchUserProfile(username: string) {
    return this.executeQuery(userProfileQuery, { username });
  }

  /**
   * Fetch user submissions
   */
  async fetchUserSubmissions(username: string, limit: number = 20) {
    return this.executeQuery(userSubmissionsQuery, { username, limit });
  }

  /**
   * Fetch the daily challenge
   */
  async fetchDailyChallenge() {
    return this.executeQuery(dailyChallengeQuery);
  }

  /**
   * Fetch details about a specific problem
   */
  async fetchProblem(titleSlug: string) {
    return this.executeQuery(problemDetailsQuery, { titleSlug });
  }

  /**
   * Search for problems matching criteria
   */
  async searchProblems(tags?: string, difficulty?: string, limit: number = 20, skip: number = 0) {
    return this.executeQuery(searchProblemsQuery, { 
      categorySlug: "",
      limit,
      skip,
      filters: {
        tags: tags ? tags.split("+") : [],
        difficulty: difficulty || null
      }
    });
  }

  /**
   * Fetch contest details
   */
  async fetchContestDetails(contestSlug: string) {
    return this.executeQuery(contestDetailsQuery, { contestSlug });
  }

  /**
   * Fetch user contest ranking
   */
  async fetchUserContestRanking(username: string) {
    return this.executeQuery(userContestRankingQuery, { username });
  }
}