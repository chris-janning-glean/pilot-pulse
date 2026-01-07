// Core types for Pilot Command

export type AuthType = 'api-key' | 'oauth';

export interface ApiConfig {
  name: string;
  endpoint: string;
  authType?: AuthType;
  apiKey?: string;
  oauthToken?: string;
  headers?: Record<string, string>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  apiConfigs: string[]; // References to API config names
}

export interface FeedbackTicket {
  id: string;
  ticketKey: string;
  summary: string;
  description: string;
  userEmail: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category?: string;
  created: string;
  updated: string;
  status: string;
  labels: string[];
  url: string;
  // Parsed fields from description
  deployment?: string;
  stt?: string;
  issueType?: string;
  comments?: string;
  agentId?: string;
}

export interface SentimentMetrics {
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positiveRate: number;
  negativeRate: number;
  trendData: SentimentTrendPoint[];
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface UserActivity {
  userEmail: string;
  totalQueries: number;
  thumbsUp: number;
  thumbsDown: number;
  lastActive: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface GleanSearchParams {
  query: string;
  pageSize?: number;
  cursor?: string;
  requestOptions?: {
    datasourceFilter?: string[];
    datasourcesFilter?: string[];  // Note: API uses plural form
    facetFilters?: Array<{
      fieldName: string;
      values: Array<{
        value: string;
        relationType: string;
      }>;
    }>;
  };
}

export interface GleanSearchResult {
  title: string;
  url: string;
  snippet: string;
  datasource: string;
  timestamp: string;
  metadata?: Record<string, any>;
  backlinkResults?: GleanBacklinkResult[];
}

export interface GleanSearchStats {
  clusterHeads: number;  // Top-level results (what you see as rows)
  totalIssues: number;    // Cluster heads + all backlink results (UI-style count)
  pages: number;          // Number of pages fetched
}

// Glean API response types
export interface GleanDocument {
  datasource?: string;
  title?: string;
  updatedAt?: string;
  id?: string;
  mimeType?: string;
  url?: string;
  metadata?: {
    documentId?: string;
    [key: string]: any;
  };
}

export interface GleanBacklinkResult {
  document?: GleanDocument;
  title?: string;
  url?: string;
  snippet?: {
    text?: string;
  };
}

export interface GleanSearchResponse {
  results?: Array<{
    title?: string;
    url?: string;
    snippet?: {
      text?: string;
    };
    document?: GleanDocument;
    metadata?: Record<string, any>;
    backlinkResults?: GleanBacklinkResult[];
  }>;
  trackingToken?: string;
  cursor?: string;
  hasMoreResults?: boolean;
  errorInfo?: {
    message?: string;
  };
}
