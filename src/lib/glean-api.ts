import type {
  GleanSearchParams,
  GleanSearchResult,
  GleanSearchResponse,
  FeedbackTicket,
  GleanSearchStats,
} from '@/types';
import { getApiManager } from './api-manager';

const GLEAN_API_CONFIG = 'glean';

export class GleanApi {
  /**
   * Search for content using Glean Search API via Next.js API proxy
   * (Proxied through our API route to avoid CORS issues)
   */
  async search(params: GleanSearchParams): Promise<GleanSearchResult[]> {
    // Build the request body for Glean REST API v1
    const requestBody: any = {
      query: params.query,
    };

    if (params.pageSize) {
      requestBody.pageSize = params.pageSize;
    }

    if (params.cursor) {
      requestBody.cursor = params.cursor;
    }

    // Pass through the entire requestOptions object with proper filters
    if (params.requestOptions) {
      requestBody.requestOptions = {};
      
      // Handle datasourcesFilter (plural - the correct API field name)
      if (params.requestOptions.datasourcesFilter) {
        requestBody.requestOptions.datasourcesFilter = params.requestOptions.datasourcesFilter;
      } else if (params.requestOptions.datasourceFilter) {
        // Fallback for legacy code
        requestBody.requestOptions.datasourcesFilter = params.requestOptions.datasourceFilter;
      }
      
      // Handle facetFilters
      if (params.requestOptions.facetFilters) {
        requestBody.requestOptions.facetFilters = params.requestOptions.facetFilters;
      }
    }

    // Call our Next.js API route which proxies to Glean (avoids CORS)
    const response = await fetch('/api/glean/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return this.transformSearchResults(data);
  }

  /**
   * Search with cursor-based pagination to fetch ALL results
   * Returns all results and statistics about the search
   */
  async searchAllPages(
    params: GleanSearchParams
  ): Promise<{ results: GleanSearchResult[]; stats: GleanSearchStats; rawResults: any[] }> {
    const allResults: GleanSearchResult[] = [];
    const allRawResults: any[] = [];
    const allResponses: any[] = [];  // Store full responses for counting allClusteredResults
    let cursor: string | undefined;
    let page = 0;
    let emptyPageCount = 0;
    const MAX_EMPTY_PAGES = 3;

    // Use the params without cursor for the first request
    const baseParams = { ...params };
    delete baseParams.cursor;

    while (true) {
      const searchParams = cursor
        ? { ...baseParams, cursor }
        : baseParams;

      // Call search with pagination
      const requestBody: any = {
        query: searchParams.query,
        pageSize: searchParams.pageSize || 100,
      };

      if (searchParams.cursor) {
        requestBody.cursor = searchParams.cursor;
      }

      if (searchParams.requestOptions) {
        requestBody.requestOptions = {};
        
        if (searchParams.requestOptions.datasourcesFilter) {
          requestBody.requestOptions.datasourcesFilter = searchParams.requestOptions.datasourcesFilter;
        } else if (searchParams.requestOptions.datasourceFilter) {
          requestBody.requestOptions.datasourcesFilter = searchParams.requestOptions.datasourceFilter;
        }
        
        if (searchParams.requestOptions.facetFilters) {
          requestBody.requestOptions.facetFilters = searchParams.requestOptions.facetFilters;
        }
      }

      const response = await fetch('/api/glean/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: GleanSearchResponse = await response.json();
      const pageResults = this.transformSearchResults(data);
      
      // Store full response for counting allClusteredResults
      allResponses.push(data);
      
      // Log response structure for debugging
      if (page === 0) {
        console.log(`📋 Response structure: hasResults=${!!data.results}, hasAllClusteredResults=${!!(data as any).allClusteredResults}`);
      }
      
      allResults.push(...pageResults);
      if (data.results) {
        allRawResults.push(...data.results);
        
        // Count backlinks in this page
        let pageBacklinks = 0;
        for (const result of data.results) {
          const backlinks = result.backlinkResults ?? [];
          const jiraBacklinks = backlinks.filter((b: any) => b.document?.datasource === 'jira').length;
          pageBacklinks += jiraBacklinks;
        }
        
        page += 1;
        console.log(
          `📄 Fetched page ${page}: ${pageResults.length} cluster heads + ${pageBacklinks} backlinks = ${pageResults.length + pageBacklinks} total (cumulative: ${allResults.length} cluster heads)`
        );
        console.log(`   cursor: ${data.cursor ? 'present' : 'missing'}, hasMoreResults: ${data.hasMoreResults}`);
      } else {
        page += 1;
        console.log(`📄 Fetched page ${page}: 0 results`);
      }

      // Get cursor and hasMoreResults first
      cursor = data.cursor;
      const hasMore = data.hasMoreResults;

      // Track empty pages for safety
      if (pageResults.length === 0) {
        emptyPageCount++;
        console.log(`⚠️  Got 0 results but hasMoreResults=${hasMore}, continuing... (empty page ${emptyPageCount}/${MAX_EMPTY_PAGES})`);
        
        // Safety: stop after MAX_EMPTY_PAGES consecutive empty pages
        if (emptyPageCount >= MAX_EMPTY_PAGES) {
          console.log(`🛑 Stopping after ${MAX_EMPTY_PAGES} consecutive empty pages`);
          break;
        }
      } else {
        emptyPageCount = 0; // Reset counter when we get results
      }

      // Cursor pagination logic: Stop when no cursor OR hasMoreResults is false
      if (!cursor || hasMore === false) {
        console.log(`🛑 Stopping pagination: cursor=${!!cursor}, hasMore=${hasMore}`);
        break;
      }
    }

    // Calculate stats from all raw results and responses
    const stats = this.calculateSearchStats(allRawResults, allResponses);
    stats.pages = page;

    console.log(`✅ Search complete: ${stats.clusterHeads} top-level, ${stats.totalIssues} total issues (${page} pages)`);

    return { results: allResults, stats, rawResults: allRawResults };
  }

  /**
   * Count issues like the Glean UI does:
   * CRITICAL: Must extract from ALL three locations per GLEAN_RESULT_EXTRACTION.md:
   * 1. results[].document
   * 2. results[].clusteredResults[].document
   * 3. results[].allClusteredResults[].clusteredResults[].document
   * This ensures counts match the Glean UI "Found N results"
   */
  calculateSearchStats(rawResults: any[], allResponses: any[] = []): GleanSearchStats {
    let topLevelCount = 0;
    let clusteredCount = 0;

    // Count from ALL three extraction points
    for (const result of rawResults) {
      // Count top-level Jira result
      if (result.document?.datasource === 'jira') {
        topLevelCount += 1;
      }

      // Count clusteredResults[] within this result
      const clustered = result.clusteredResults ?? [];
      const jiraClustered = clustered.filter(
        (c: any) => c.document?.datasource === 'jira'
      ).length;
      clusteredCount += jiraClustered;
      
      if (jiraClustered > 0) {
        console.log(`   Result has ${jiraClustered} clustered Jira tickets`);
      }

      // Count backlinkResults[] (alternative field name)
      const backlinks = result.backlinkResults ?? [];
      const jiraBacklinks = backlinks.filter(
        (b: any) => b.document?.datasource === 'jira'
      ).length;
      if (jiraBacklinks > 0) {
        clusteredCount += jiraBacklinks;
        console.log(`   Result has ${jiraBacklinks} backlink Jira tickets`);
      }
    }

    // Also check for allClusteredResults[] at response level
    for (const response of allResponses) {
      const allClustered = response.allClusteredResults ?? [];
      for (const cluster of allClustered) {
        const nestedResults = cluster.clusteredResults ?? [];
        const jiraNestedCount = nestedResults.filter(
          (r: any) => r.document?.datasource === 'jira'
        ).length;
        if (jiraNestedCount > 0) {
          clusteredCount += jiraNestedCount;
          console.log(`   Found ${jiraNestedCount} Jira tickets in allClusteredResults`);
        }
      }
    }

    const totalIssues = topLevelCount + clusteredCount;

    console.log(`📊 Counting Summary:`);
    console.log(`   - Top-level Jira tickets: ${topLevelCount}`);
    console.log(`   - Clustered/backlink tickets: ${clusteredCount}`);
    console.log(`   - TOTAL ISSUES (matches UI): ${totalIssues}`);

    return {
      clusterHeads: topLevelCount,
      totalIssues: totalIssues,  // Total includes all clustered results
      pages: 0, // Will be set by searchAllPages
    };
  }

  /**
   * Get feedback tickets (thumbs up/down) from Jira
   * Uses Glean Search to find tickets with specific labels
   */
  async getFeedbackTickets(
    customerLabel?: string,
    duration: string = '30d'
  ): Promise<FeedbackTicket[]> {
    const query = this.buildFeedbackQuery(customerLabel, duration);
    
    const searchResults = await this.search({
      query,
      pageSize: 100,
    });

    return this.transformToFeedbackTickets(searchResults);
  }

  /**
   * Get thumbs down tickets specifically
   * Query format: app:jira component:"GleanChat Bad Queries" customerLabel
   */
  async getThumbsDownTickets(
    customerLabel?: string,
    duration: string = '30d'
  ): Promise<FeedbackTicket[]> {
    // Use proper Glean API filters (recommended by Glean)
    const query = customerLabel || '';  // free-text search only
    
    const searchResults = await this.search({
      query,
      pageSize: 1000,
      requestOptions: {
        datasourcesFilter: ['jira'],  // Note: plural form
        facetFilters: [
          {
            fieldName: 'component',
            values: [
              {
                value: 'GleanChat Bad Queries',
                relationType: 'EQUALS',
              },
            ],
          },
        ],
      },
    });

    return this.transformToFeedbackTickets(searchResults);
  }

  /**
   * Get thumbs up tickets
   * Query format: app:jira component:"GleanChat Good Queries" customerLabel
   */
  async getThumbsUpTickets(
    customerLabel?: string,
    duration: string = '30d'
  ): Promise<FeedbackTicket[]> {
    // Use proper Glean API filters (recommended by Glean)
    const query = customerLabel || '';  // free-text search only
    
    const searchResults = await this.search({
      query,
      pageSize: 1000,
      requestOptions: {
        datasourcesFilter: ['jira'],  // Note: plural form
        facetFilters: [
          {
            fieldName: 'component',
            values: [
              {
                value: 'GleanChat Good Queries',
                relationType: 'EQUALS',
              },
            ],
          },
        ],
      },
    });

    return this.transformToFeedbackTickets(searchResults);
  }

  /**
   * Search for user-specific feedback
   */
  async getUserFeedback(userEmail: string): Promise<FeedbackTicket[]> {
    const query = `app:jira component:"GleanChat Bad Queries" ${userEmail}`;

    const searchResults = await this.search({
      query,
      pageSize: 50,
    });

    return this.transformToFeedbackTickets(searchResults);
  }

  private buildFeedbackQuery(
    customerLabel?: string,
    duration: string = '30d'
  ): string {
    let query = 'app:jira labels:manual-feedback';
    
    if (customerLabel) {
      query += ` "Interested Customers[Labels]" IN (${customerLabel})`;
    }
    
    // Note: Date filtering might need adjustment based on your setup
    // query += ` created:${duration}`;
    
    return query;
  }

  private transformSearchResults(response: GleanSearchResponse): GleanSearchResult[] {
    if (!response.results || response.results.length === 0) {
      return [];
    }

    return response.results.map(result => {
      const doc = result.document || {};
      const snippet = result.snippet?.text || '';
      
      return {
        title: result.title || doc.title || 'Untitled',
        url: result.url || '',
        snippet: snippet,
        datasource: doc.datasource || 'unknown',
        timestamp: doc.updatedAt || new Date().toISOString(),
        metadata: {
          id: doc.id,
          mimeType: doc.mimeType,
          ...result.metadata,
        },
        backlinkResults: result.backlinkResults, // Preserve backlink results for UI-style counting
      };
    });
  }

  private parseDescriptionFields(description: string): {
    deployment?: string;
    stt?: string;
    issueType?: string;
    comments?: string;
    agentId?: string;
    category?: string;
    user?: string;
  } {
    const fields: any = {};
    
    // Extract Deployment
    const deploymentMatch = description.match(/Deployment:\s*(.+?)(?:\n|$)/i);
    if (deploymentMatch) fields.deployment = deploymentMatch[1].trim();
    
    // Extract User (already extracted as userEmail from summary, but backup here)
    const userMatch = description.match(/User:\s*(.+?)(?:\n|$)/i);
    if (userMatch) fields.user = userMatch[1].trim();
    
    // Extract STT
    const sttMatch = description.match(/STT:\s*(.+?)(?:\n|$)/i);
    if (sttMatch) fields.stt = sttMatch[1].trim();
    
    // Extract Category (e.g., "CHAT (9)")
    const categoryMatch = description.match(/Category:\s*(.+?)(?:\n|$)/i);
    if (categoryMatch) fields.category = categoryMatch[1].trim();
    
    // Extract Issue type
    const issueMatch = description.match(/Issue:\s*(.+?)(?:\n|$)/i);
    if (issueMatch) fields.issueType = issueMatch[1].trim();
    
    // Extract Comments (may span multiple lines)
    const commentsMatch = description.match(/Comments:\s*(.+?)(?:\n(?:AgentId|Debugging|View|$))/is);
    if (commentsMatch) fields.comments = commentsMatch[1].trim();
    
    // Extract AgentId
    const agentIdMatch = description.match(/AgentId:\s*(.+?)(?:\n|$)/i);
    if (agentIdMatch) fields.agentId = agentIdMatch[1].trim();
    
    return fields;
  }

  private transformToFeedbackTickets(
    searchResults: GleanSearchResult[]
  ): FeedbackTicket[] {
    return searchResults.map(result => {
      const userEmail = this.extractEmailFromSummary(result.title);
      const sentiment = this.determineSentiment(result);
      const parsedFields = this.parseDescriptionFields(result.snippet);

      return {
        id: result.metadata?.id || this.generateId(result.url),
        ticketKey: this.extractTicketKey(result.url),
        summary: result.title,
        description: result.snippet,
        userEmail,
        sentiment,
        category: parsedFields.category || result.metadata?.category || 'N/A',
        created: result.timestamp,
        updated: result.metadata?.updated || result.timestamp,
        status: result.metadata?.status || 'Open',
        labels: result.metadata?.labels || [],
        url: result.url,
        // Parsed fields
        deployment: parsedFields.deployment,
        stt: parsedFields.stt,
        issueType: parsedFields.issueType,
        comments: parsedFields.comments,
        agentId: parsedFields.agentId,
      };
    });
  }

  private extractEmailFromSummary(summary: string): string {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const match = summary.match(emailRegex);
    return match ? match[0] : 'unknown@example.com';
  }

  private extractTicketKey(url: string): string {
    const match = url.match(/[A-Z]+-\d+/);
    return match ? match[0] : 'UNKNOWN';
  }

  private determineSentiment(
    result: GleanSearchResult
  ): 'positive' | 'negative' | 'neutral' {
    const title = result.title.toLowerCase();
    const snippet = result.snippet.toLowerCase();
    const combined = `${title} ${snippet}`;

    if (
      combined.includes('bad queries') ||
      combined.includes('thumbs down') ||
      combined.includes('negative')
    ) {
      return 'negative';
    }

    if (
      combined.includes('good queries') ||
      combined.includes('thumbs up') ||
      combined.includes('positive')
    ) {
      return 'positive';
    }

    return 'neutral';
  }

  private generateId(url: string): string {
    return url.split('/').pop() || Math.random().toString(36).substring(7);
  }
}

export const gleanApi = new GleanApi();
