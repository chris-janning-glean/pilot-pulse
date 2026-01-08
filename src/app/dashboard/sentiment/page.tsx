'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SentimentOverview } from '@/components/sentiment/SentimentOverview';
import { SentimentChart } from '@/components/sentiment/SentimentChart';
import { FeedbackTable } from '@/components/sentiment/FeedbackTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { FeedbackTicket, SentimentMetrics } from '@/types';
import { gleanApi } from '@/lib/glean-api';
import { initializeApiManager } from '@/lib/api-manager';
import { DEFAULT_API_CONFIGS } from '@/lib/config';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { buttonStyles } from '@/lib/commonStyles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

function SentimentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize customer from URL param or default to 'whirlpool'
  const initialCustomer = searchParams.get('customer') || 'whirlpool';
  
  const [allFeedback, setAllFeedback] = useState<FeedbackTicket[]>([]); // Store all feedback
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackTicket[]>([]); // Filtered by date range
  const [metrics, setMetrics] = useState<SentimentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [searchStats, setSearchStats] = useState<{ 
    clusterHeads: number; 
    totalIssues: number; 
    pages: number;
    negativeCount?: number;
    positiveCount?: number;
    negativePages?: number;
    positivePages?: number;
  } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(initialCustomer);
  const [negativeAgentResponse, setNegativeAgentResponse] = useState<any>(null);
  const [positiveAgentResponse, setPositiveAgentResponse] = useState<any>(null);
  const [negativeAgentLoading, setNegativeAgentLoading] = useState(false);
  const [positiveAgentLoading, setPositiveAgentLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState<1 | 7 | 14 | 30>(7);
  const [positiveFeedback, setPositiveFeedback] = useState<any[]>([]);
  const [negativeFeedback, setNegativeFeedback] = useState<any[]>([]);
  const [negativeApiCall, setNegativeApiCall] = useState<any>(null);
  const [positiveApiCall, setPositiveApiCall] = useState<any>(null);
  const [showApiCalls, setShowApiCalls] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const ITEMS_PER_PAGE = 10;

  // Generate trend data from raw results (which have createTime)
  // CRITICAL: Extract from ALL three locations per GLEAN_RESULT_EXTRACTION.md
  const generateTrendData = () => {
    console.log('📊 generateTrendData called, rawResponse:', rawResponse ? {
      hasNegative: !!rawResponse.negative,
      negativeLength: rawResponse.negative?.length,
      hasPositive: !!rawResponse.positive,
      positiveLength: rawResponse.positive?.length
    } : 'null');
    
    if (!rawResponse?.negative && !rawResponse?.positive) {
      console.warn('⚠️ No rawResponse data available for trend chart');
      return [];
    }
    
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - timeRange);
    
    // Group feedback by date and sentiment from ALL extraction points
    const dateGroups: { [key: string]: { positive: number; negative: number } } = {};
    const seenIds = new Set<string>();  // Deduplicate by ID
    
    // Process both negative and positive results
    const processResults = (results: any[], sentiment: 'positive' | 'negative') => {
      if (!results) return;
      
      for (const result of results) {
        // 1. Primary result
        const createTime = result.document?.metadata?.createTime;
        if (createTime && result.document?.datasource === 'jira') {
          const id = result.document.id;
          if (!seenIds.has(id)) {
            const ticketDate = new Date(createTime);
            if (ticketDate >= startDate) {
              const dateKey = ticketDate.toISOString().split('T')[0];
              if (!dateGroups[dateKey]) {
                dateGroups[dateKey] = { positive: 0, negative: 0 };
              }
              dateGroups[dateKey][sentiment]++;
            }
            seenIds.add(id);
          }
        }
        
        // 2. ClusteredResults
        const clustered = result.clusteredResults || [];
        for (const cluster of clustered) {
          const clusterCreateTime = cluster.document?.metadata?.createTime;
          if (clusterCreateTime && cluster.document?.datasource === 'jira') {
            const id = cluster.document.id;
            if (!seenIds.has(id)) {
              const ticketDate = new Date(clusterCreateTime);
              if (ticketDate >= startDate) {
                const dateKey = ticketDate.toISOString().split('T')[0];
                if (!dateGroups[dateKey]) {
                  dateGroups[dateKey] = { positive: 0, negative: 0 };
                }
                dateGroups[dateKey][sentiment]++;
              }
              seenIds.add(id);
            }
          }
        }
        
        // 3. AllClusteredResults (nested)
        const allClustered = result.allClusteredResults || [];
        for (const clusterGroup of allClustered) {
          const groupClustered = clusterGroup.clusteredResults || [];
          for (const cluster of groupClustered) {
            const clusterCreateTime = cluster.document?.metadata?.createTime;
            if (clusterCreateTime && cluster.document?.datasource === 'jira') {
              const id = cluster.document.id;
              if (!seenIds.has(id)) {
                const ticketDate = new Date(clusterCreateTime);
                if (ticketDate >= startDate) {
                  const dateKey = ticketDate.toISOString().split('T')[0];
                  if (!dateGroups[dateKey]) {
                    dateGroups[dateKey] = { positive: 0, negative: 0 };
                  }
                  dateGroups[dateKey][sentiment]++;
                }
                seenIds.add(id);
              }
            }
          }
        }
      }
    };
    
    // Process negative results (rawResponse.negative is already an array)
    if (rawResponse.negative && Array.isArray(rawResponse.negative)) {
      processResults(rawResponse.negative, 'negative');
    }
    
    // Process positive results (rawResponse.positive is already an array)
    if (rawResponse.positive && Array.isArray(rawResponse.positive)) {
      processResults(rawResponse.positive, 'positive');
    }
    
    // Generate array of dates for the range with separate positive/negative counts
    const trendData = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const counts = dateGroups[dateKey] || { positive: 0, negative: 0 };
      
      trendData.push({
        date: dateKey,
        positive: counts.positive,
        negative: counts.negative,
        total: counts.positive + counts.negative,
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    
    console.log('📊 Trend data generated:', trendData.length, 'data points', trendData);
    return trendData;
  };

  // Generate pie chart data by issue type
  const generateIssueTypeData = () => {
    if (!filteredFeedback || filteredFeedback.length === 0) return [];
    
    const issueGroups: { [key: string]: number } = {};
    
    filteredFeedback.forEach((item: any) => {
      const issueType = item.issueType || 'Unknown';
      issueGroups[issueType] = (issueGroups[issueType] || 0) + 1;
    });
    
    return Object.entries(issueGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Colors for pie chart
  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316', '#06b6d4'];

  // Filter feedback by time range
  const filterFeedbackByTimeRange = (feedback: any[], days: number) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    
    return feedback.filter((item: any) => {
      if (!item.createTime) return false;
      const itemDate = new Date(item.createTime);
      return itemDate >= startDate;
    });
  };

  // Update filtered feedback when timeRange changes
  React.useEffect(() => {
    if (allFeedback.length > 0) {
      const filtered = filterFeedbackByTimeRange(allFeedback, timeRange);
      setFilteredFeedback(filtered);
      
      // Recalculate metrics for filtered data
      const positiveCount = filtered.filter((f: any) => f.sentiment === 'positive').length;
      const negativeCount = filtered.filter((f: any) => f.sentiment === 'negative').length;
      const totalFeedback = filtered.length;
      
      setMetrics({
        totalFeedback,
        positiveCount,
        negativeCount,
        neutralCount: 0,
        positiveRate: totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0,
        negativeRate: totalFeedback > 0 ? (negativeCount / totalFeedback) * 100 : 0,
        trendData: [],
      });
    }
  }, [timeRange, allFeedback]);

  // Convert time range to timeframe string
  const getTimeframeString = (days: number): string => {
    switch (days) {
      case 1: return 'past_day';
      case 7: return 'past_week';
      case 14: return 'past_2_weeks';
      case 30: return 'past_month';
      default: return 'past_week';
    }
  };

  const callNegativeAgent = async (customerName: string, timeframeDays: number) => {
    try {
      setNegativeAgentLoading(true);
      const timeframe = getTimeframeString(timeframeDays);
      console.log(`🤖 Calling NEGATIVE feedback agent for customer: ${customerName}, timeframe: ${timeframe}`);
      
      const response = await fetch('/api/glean/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: '4a5c57e875fa46e38ae4be94345fc7da',
          customerName: customerName,
          feedbackType: 'negative',
          timeframe: timeframe
        }),
      });

      if (!response.ok) {
        throw new Error(`Negative agent API failed: ${response.status}`);
      }

      const data = await response.json();
      setNegativeAgentResponse(data);
      console.log(`✅ Negative agent response received:`, data);
    } catch (err) {
      console.error('Error calling negative agent:', err);
      setNegativeAgentResponse({ error: err instanceof Error ? err.message : 'Failed to call agent' });
    } finally {
      setNegativeAgentLoading(false);
    }
  };

  const callPositiveAgent = async (customerName: string, timeframeDays: number) => {
    try {
      setPositiveAgentLoading(true);
      const timeframe = getTimeframeString(timeframeDays);
      console.log(`🤖 Calling POSITIVE feedback agent for customer: ${customerName}, timeframe: ${timeframe}`);
      
      const response = await fetch('/api/glean/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: '4a5c57e875fa46e38ae4be94345fc7da',
          customerName: customerName,
          feedbackType: 'positive',
          timeframe: timeframe
        }),
      });

      if (!response.ok) {
        throw new Error(`Positive agent API failed: ${response.status}`);
      }

      const data = await response.json();
      setPositiveAgentResponse(data);
      console.log(`✅ Positive agent response received:`, data);
    } catch (err) {
      console.error('Error calling positive agent:', err);
      setPositiveAgentResponse({ error: err instanceof Error ? err.message : 'Failed to call agent' });
    } finally {
      setPositiveAgentLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Starting search for BOTH positive and negative feedback...');

      const customerQuery = `glean-${selectedCustomer}`;
      
      // Define negative API call
      const negativeApiCallParams = {
        query: customerQuery,
        pageSize: 100,
        requestOptions: {
          datasourcesFilter: ['jira'],
          facetFilters: [
            {
              fieldName: 'component',
              values: [
                { value: 'GleanChat Bad Queries', relationType: 'EQUALS' }
              ]
            },
            {
              fieldName: 'label',
              values: [
                { value: 'mf-issue-other', relationType: 'EQUALS' },
                { value: 'mf-issue-incorrect-answer', relationType: 'EQUALS' },
                { value: 'mf-issue-partial-answer', relationType: 'EQUALS' },
                { value: 'mf-issue-incomplete-or-no-answer', relationType: 'EQUALS' },
                { value: 'mf-issue-inaccurate-response', relationType: 'EQUALS' },
                { value: 'mf-issue-not-question', relationType: 'EQUALS' },
                { value: 'mf-issue-not-sure', relationType: 'EQUALS' },
                { value: 'mf-issue-missing-citation', relationType: 'EQUALS' },
                { value: 'mf-issue-search-google-in-middle', relationType: 'EQUALS' },
              ],
            },
          ],
        },
      };
      
      // Define positive API call
      const positiveApiCallParams = {
        query: customerQuery,  // Keep query dynamic based on customer
        pageSize: 100,
        requestOptions: {
          datasourcesFilter: ['jira'],
          facetFilters: [
            {
              fieldName: 'component',
              values: [
                { value: 'GleanChat Bad Queries', relationType: 'EQUALS' }
              ]
            },
            {
              fieldName: 'status',
              values: [
                { value: 'Closed', relationType: 'EQUALS' }
              ]
            },
            {
              fieldName: 'label',
              values: [
                { value: 'mf-issue-other', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-incorrect-answer', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-partial-answer', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-incomplete-or-no-answer', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-inaccurate-response', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-not-question', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-not-sure', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-missing-citation', relationType: 'NOT_EQUALS' },
                { value: 'mf-issue-search-google-in-middle', relationType: 'NOT_EQUALS' }
              ]
            }
          ],
        },
      };
      
      // Store API call parameters
      setNegativeApiCall(negativeApiCallParams);
      setPositiveApiCall(positiveApiCallParams);
      
      // Fetch NEGATIVE feedback (WITH mf-issue labels)
      console.log(`   📉 Fetching negative feedback for ${customerQuery}...`);
      const negativeResults = await gleanApi.searchAllPages(negativeApiCallParams);

      // Fetch POSITIVE feedback (WITHOUT mf-issue labels, SAME customer)
      console.log(`   📈 Fetching positive feedback for ${customerQuery}...`);
      const positiveResults = await gleanApi.searchAllPages(positiveApiCallParams);

      const combinedStats = {
        negativeCount: negativeResults.stats.totalIssues,
        positiveCount: positiveResults.stats.totalIssues,
        totalIssues: negativeResults.stats.totalIssues + positiveResults.stats.totalIssues,
        clusterHeads: negativeResults.stats.clusterHeads + positiveResults.stats.clusterHeads,
        pages: negativeResults.stats.pages + positiveResults.stats.pages,
        negativePages: negativeResults.stats.pages,
        positivePages: positiveResults.stats.pages,
      };
      
      // Combine results for processing
      const rawResults = [...negativeResults.rawResults, ...positiveResults.rawResults];
      
      console.log(`✅ Fetched ${combinedStats.negativeCount} negative + ${combinedStats.positiveCount} positive = ${combinedStats.totalIssues} total`);
      
      // Store search stats
      setSearchStats(combinedStats);
      
      // Helper function to extract email from title
      const extractEmailFromTitle = (title: string): string | undefined => {
        // Pattern: "[...] GleanChat: user@email.com"
        const match = title.match(/GleanChat:\s*([^\s]+@[^\s]+)/i);
        return match ? match[1] : undefined;
      };

      // Helper function to parse snippets array
      const parseSnippets = (snippets: any[], title: string) => {
        const fields: any = {};
        if (!snippets || snippets.length === 0) {
          // If no snippets, try to extract email from title
          const email = extractEmailFromTitle(title);
          if (email) fields.user = email;
          return fields;
        }
        
        // Combine all snippet text
        const combinedText = snippets.map(s => s.text || '').join(' ');
        
        // Extract fields using regex to handle both multi-line and single-line formats
        const deploymentMatch = combinedText.match(/Deployment:\s*([^\s]+)/);
        if (deploymentMatch) fields.deployment = deploymentMatch[1];
        
        const userMatch = combinedText.match(/User:\s*([^\s]+)/);
        if (userMatch) fields.user = userMatch[1];
        
        const sttMatch = combinedText.match(/STT:\s*([^\s]+)/);
        if (sttMatch) fields.stt = sttMatch[1];
        
        const categoryMatch = combinedText.match(/Category:\s*([^I]+?)(?=Issue:|$)/);
        if (categoryMatch) fields.category = categoryMatch[1].trim();
        
        const issueMatch = combinedText.match(/Issue:\s*([^C]+?)(?=Comments:|$)/);
        if (issueMatch) fields.issueType = issueMatch[1].trim();
        
        const commentsMatch = combinedText.match(/Comments:\s*(.+?)(?=Deployment:|User:|STT:|Category:|Issue:|AgentId:|$)/);
        if (commentsMatch) fields.comments = commentsMatch[1].trim();
        
        const agentMatch = combinedText.match(/AgentId:\s*([^\s]+)/);
        if (agentMatch) fields.agentId = agentMatch[1];
        
        // Fallback: if User not found in snippets, try title
        if (!fields.user) {
          const email = extractEmailFromTitle(title);
          if (email) fields.user = email;
        }
        
        return fields;
      };

      // Extract feedback from NEGATIVE results
      const extractFeedback = (results: any[], sentiment: 'positive' | 'negative') => {
        const feedback: any[] = [];
        const seenIds = new Set<string>();
        
        for (const rawResult of results) {
        const snippets = rawResult.snippets || [];
        const title = rawResult.title || '';
        const parsed = parseSnippets(snippets, title);
        
        // Add top-level result
        if (rawResult.document?.datasource === 'jira') {
          const id = rawResult.document.id;
          if (!seenIds.has(id)) {
            const createTime = rawResult.document.metadata?.createTime;
            let formattedDate = '-';
            if (createTime) {
              try {
                formattedDate = new Date(createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              } catch (e) {
                console.warn('Failed to parse date:', createTime);
              }
            }
            
            feedback.push({
              id: id,
              ticketKey: rawResult.document.metadata?.documentId || id,
              summary: title,
              url: rawResult.url,
              date: formattedDate,
              createTime: createTime,
              sentiment: sentiment,
              ...parsed,
            });
            seenIds.add(id);
          }
        }
        
        // Add clusteredResults
        const clustered = rawResult.clusteredResults || [];
        for (const cluster of clustered) {
          if (cluster.document?.datasource === 'jira') {
            const id = cluster.document.id;
            if (!seenIds.has(id)) {
              const clusterSnippets = cluster.snippets || [];
              const clusterTitle = cluster.title || '';
              const clusterParsed = parseSnippets(clusterSnippets, clusterTitle);
              const createTime = cluster.document.metadata?.createTime;
              let formattedDate = '-';
              if (createTime) {
                try {
                  formattedDate = new Date(createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch (e) {
                  console.warn('Failed to parse date:', createTime);
                }
              }
              
              feedback.push({
                id: id,
                ticketKey: cluster.document.metadata?.documentId || id,
                summary: clusterTitle,
                url: cluster.url,
                date: formattedDate,
                createTime: createTime,
                sentiment: sentiment,
                ...clusterParsed,
              });
              seenIds.add(id);
            }
          }
        }
        
        // Add allClusteredResults
        const allClustered = rawResult.allClusteredResults || [];
        for (const clusterGroup of allClustered) {
          const groupClustered = clusterGroup.clusteredResults || [];
          for (const cluster of groupClustered) {
            if (cluster.document?.datasource === 'jira') {
              const id = cluster.document.id;
              if (!seenIds.has(id)) {
                const clusterSnippets = cluster.snippets || [];
                const clusterTitle = cluster.title || '';
                const clusterParsed = parseSnippets(clusterSnippets, clusterTitle);
                const createTime = cluster.document.metadata?.createTime;
                let formattedDate = '-';
                if (createTime) {
                  try {
                    formattedDate = new Date(createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  } catch (e) {
                    console.warn('Failed to parse date:', createTime);
                  }
                }
                
                feedback.push({
                  id: id,
                  ticketKey: cluster.document.metadata?.documentId || id,
                  summary: clusterTitle,
                  url: cluster.url,
                  date: formattedDate,
                  createTime: createTime,
                  sentiment: sentiment,
                  ...clusterParsed,
                });
                seenIds.add(id);
              }
            }
          }
        }
        }
        
        return feedback;
      };
      
      // Extract negative and positive feedback
      const negativeFeedbackData = extractFeedback(negativeResults.rawResults, 'negative');
      const positiveFeedbackData = extractFeedback(positiveResults.rawResults, 'positive');
      const allFeedbackItems = [...negativeFeedbackData, ...positiveFeedbackData].sort((a, b) => {
        // Sort by date descending (newest first)
        if (!a.createTime) return 1;
        if (!b.createTime) return -1;
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
      });
      
      console.log(`📋 Extracted feedback:`);
      console.log(`   👎 Negative: ${negativeFeedbackData.length} items`);
      console.log(`   👍 Positive: ${positiveFeedbackData.length} items`);
      console.log(`   📊 Total: ${allFeedbackItems.length} items (sorted by date)`);
      
      // Debug: log first item to see if date is present
      if (allFeedbackItems.length > 0) {
        console.log(`   🔍 First item:`, {
          ticketKey: allFeedbackItems[0].ticketKey,
          date: allFeedbackItems[0].date,
          sentiment: allFeedbackItems[0].sentiment,
          user: allFeedbackItems[0].user,
        });
      }
      
      setAllFeedback(allFeedbackItems); // Store all feedback, filtering will happen in useEffect
      setNegativeFeedback(negativeFeedbackData);
      setPositiveFeedback(positiveFeedbackData);
      setCurrentPage(1);  // Reset to first page when new data loads
      setSearchStats(combinedStats);

      // Store the raw results for debugging
      setRawResponse({ 
        negative: negativeResults.rawResults, 
        positive: positiveResults.rawResults, 
        stats: combinedStats 
      });
      
      // Set last updated timestamp
      setLastUpdated(new Date());
      
      console.log('✅ Search complete:');
      console.log(`   - Negative feedback: ${combinedStats.negativeCount}`);
      console.log(`   - Positive feedback: ${combinedStats.positiveCount}`);
      console.log(`   - Total: ${combinedStats.totalIssues}`);

      // Calculate sentiment metrics
      const totalFeedback = combinedStats.totalIssues;
      const positiveRate = totalFeedback > 0 ? (combinedStats.positiveCount / totalFeedback) * 100 : 0;
      const negativeRate = totalFeedback > 0 ? (combinedStats.negativeCount / totalFeedback) * 100 : 0;
      
      setMetrics({
        totalFeedback: totalFeedback,
        positiveCount: combinedStats.positiveCount,
        negativeCount: combinedStats.negativeCount,
        neutralCount: 0,
        positiveRate: positiveRate,
        negativeRate: negativeRate,
        trendData: [],
      });
      
      // Call BOTH Glean agents in the background (non-blocking)
      // This won't delay the page load - agent analyses load separately
      callNegativeAgent(selectedCustomer, timeRange).catch(err => {
        console.error('Negative agent call failed (non-blocking):', err);
      });
      
      callPositiveAgent(selectedCustomer, timeRange).catch(err => {
        console.error('Positive agent call failed (non-blocking):', err);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      const detailedError = `${errorMessage}\n\nTimestamp: ${new Date().toISOString()}\n\nEndpoint: ${process.env.NEXT_PUBLIC_GLEAN_API_ENDPOINT || 'NOT SET'}\nToken: ${process.env.NEXT_PUBLIC_GLEAN_OAUTH_TOKEN ? 'SET' : 'NOT SET'}`;
      
      setError(detailedError);
      console.error('Error loading sentiment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer]);

  // Re-call agents when timeRange changes
  useEffect(() => {
    if (selectedCustomer) {
      callNegativeAgent(selectedCustomer, timeRange).catch(err => {
        console.error('Negative agent call failed on timeRange change:', err);
      });
      
      callPositiveAgent(selectedCustomer, timeRange).catch(err => {
        console.error('Positive agent call failed on timeRange change:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, selectedCustomer]);

  // Update customer and URL - defined here so it works even during errors
  const handleCustomerChange = (customer: string) => {
    setSelectedCustomer(customer);
    router.push(`/dashboard/sentiment?customer=${customer}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <RefreshCw size={32} color="#343ced" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {/* Title Row with Customer Dropdown */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
              User Sentiment
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
              Track user satisfaction and feedback in real time
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>
              Customer:
            </span>
            <select
              value={selectedCustomer}
              onChange={(e) => handleCustomerChange(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: '#111827',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="whirlpool">Whirlpool</option>
              <option value="generalmotors">General Motors</option>
              <option value="tailoredbrands">Tailored Brands</option>
              <option value="insurity">Insurity</option>
            </select>
          </div>
        </div>

        <Card style={{ background: '#fee2e2', borderColor: '#fca5a5' }}>
          <CardHeader>
            <CardTitle style={{ color: '#991b1b' }}>⚠️ Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: 16,
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#7f1d1d',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error}
            </div>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              <button onClick={loadData} style={buttonStyles.danger}>
                🔄 Retry Connection
              </button>
              <Link href="/settings" style={{ textDecoration: 'none' }}>
                <button style={buttonStyles.secondary}>
                  ⚙️ Go to Settings
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Title Row with Customer Dropdown and Date Range Toggles */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
            User Sentiment
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
            Track user satisfaction and feedback in real time
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Customer Dropdown */}
          <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>
            Customer:
          </span>
          <select
            value={selectedCustomer}
            onChange={(e) => handleCustomerChange(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: '#111827',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="whirlpool">Whirlpool</option>
            <option value="generalmotors">General Motors</option>
            <option value="tailoredbrands">Tailored Brands</option>
            <option value="insurity">Insurity</option>
          </select>

          {/* Date Range Toggles */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 1 | 7 | 14 | 30)}
                style={{
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: timeRange === days ? '#ffffff' : '#6b7280',
                  backgroundColor: timeRange === days ? '#1f2937' : '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div style={{ 
              fontSize: 12, 
              color: '#9ca3af', 
              fontWeight: 400,
              marginLeft: 8,
              whiteSpace: 'nowrap'
            }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          )}
        </div>
      </div>

      {metrics && (
        <>
          {/* KPI Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: 12, 
            marginBottom: 32 
          }}>
            {/* Total Feedback */}
            <Card>
              <CardContent style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>📊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 400 }}>
                      Total Feedback
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>
                      {metrics.totalFeedback.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      All time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Today */}
            <Card>
              <CardContent style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 400 }}>
                      Today
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        return allFeedback.filter((f: any) => {
                          if (!f.createTime) return false;
                          const feedbackDate = new Date(f.createTime).toISOString().split('T')[0];
                          return feedbackDate === today;
                        }).length;
                      })()}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      Last 24h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positive Feedback */}
            <Card>
              <CardContent style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 400 }}>
                      Positive
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>
                      {metrics.positiveCount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      {metrics.positiveRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Negative Feedback */}
            <Card>
              <CardContent style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 400 }}>
                      Negative
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>
                      {metrics.negativeCount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      {metrics.negativeRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Score */}
            <Card>
              <CardContent style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>📈</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 400 }}>
                      Sentiment Score
                    </div>
                    <div style={{ 
                      fontSize: 32, 
                      fontWeight: 600, 
                      color: metrics.positiveRate > 50 ? '#16a34a' : metrics.positiveRate > 25 ? '#ea580c' : '#dc2626',
                      letterSpacing: '-0.02em'
                    }}>
                      {metrics.positiveRate.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      Positive rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Trend Chart and Issue Type Breakdown */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: 12, 
            marginBottom: 32 
          }}>
            {/* Feedback Trend Chart - spans 3 columns */}
            <Card style={{ gridColumn: 'span 3' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Feedback Trend (last {timeRange} days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#d1d5db"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#d1d5db"
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 20 }}
                      iconType="rect"
                    />
                    <Bar 
                      dataKey="positive" 
                      fill="#16a34a" 
                      name="👍 Positive"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="negative" 
                      fill="#dc2626" 
                      name="👎 Negative"
                      radius={[4, 4, 0, 0]}
                    />
                </BarChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issue Type Pie Chart - 2 columns */}
            <Card style={{ gridColumn: 'span 2' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>By Issue Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={generateIssueTypeData()}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={(props) => {
                        const RADIAN = Math.PI / 180;
                        const { cx, cy, midAngle, outerRadius, name, percent } = props;
                        const radius = outerRadius + 25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#374151" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{ fontSize: 10, fontWeight: 500 }}
                          >
                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {generateIssueTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ 
                  marginTop: 16, 
                  fontSize: 12, 
                  color: '#9ca3af',
                  textAlign: 'center'
                }}>
                  Distribution by issue category
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Feedback Tickets Table */}
          {filteredFeedback.length > 0 && (
            <Card style={{ marginBottom: 32 }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>All Feedback ({filteredFeedback.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Pagination Logic */}
                {(() => {
                  const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE);
                  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                  const endIndex = startIndex + ITEMS_PER_PAGE;
                  const currentItems = filteredFeedback.slice(startIndex, endIndex);
                  
                  return (
                    <>
                      <div style={{ 
                        marginBottom: 20, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0'
                      }}>
                        <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredFeedback.length)} of {filteredFeedback.length}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              style={{
                                padding: '6px 14px',
                                fontSize: 13,
                                fontWeight: 500,
                                color: currentPage === 1 ? '#9ca3af' : '#6b7280',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: 6,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Previous
                            </button>
                            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 400 }}>
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              style={{
                                padding: '6px 14px',
                                fontSize: 13,
                                fontWeight: 500,
                                color: currentPage === totalPages ? '#9ca3af' : '#6b7280',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: 6,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Next
                            </button>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto', maxHeight: 600, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                        <table style={{ 
                          width: '100%', 
                          borderCollapse: 'collapse', 
                          fontSize: 13
                        }}>
                          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fafafa' }}>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                ID
                              </th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Date
                              </th>
                              <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Sentiment
                              </th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                User
                              </th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Issue
                              </th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#6b7280', minWidth: 400 }}>
                                Comments
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.map((item, index) => (
                              <tr 
                                key={item.id || index}
                                style={{ 
                                  borderBottom: '1px solid #e5e7eb',
                                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                                }}
                              >
                                <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#2563eb',
                                      textDecoration: 'none',
                                      fontWeight: 500,
                                      fontSize: 13,
                                    }}
                                  >
                                    {item.ticketKey}
                                  </a>
                                </td>
                                <td style={{ padding: '12px', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: 13, color: '#6b7280' }}>
                                  {(item as any).date || '-'}
                                </td>
                                <td style={{ padding: '12px', verticalAlign: 'middle', textAlign: 'center' }}>
                                  {(item as any).sentiment === 'positive' ? (
                                    <span style={{
                                      padding: '3px 8px',
                                      borderRadius: 4,
                                      fontSize: 12,
                                      fontWeight: 500,
                                      backgroundColor: '#dcfce7',
                                      color: '#166534',
                                    }}>
                                      👍
                                    </span>
                                  ) : (
                                    <span style={{
                                      padding: '3px 8px',
                                      borderRadius: 4,
                                      fontSize: 12,
                                      fontWeight: 500,
                                      backgroundColor: '#fee2e2',
                                      color: '#991b1b',
                                    }}>
                                      👎
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: 13, color: '#111827' }}>
                                  {(item as any).user || '-'}
                                </td>
                                <td style={{ padding: '12px', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: 13, color: '#111827' }}>
                                  {item.issueType || '-'}
                                </td>
                                <td style={{ padding: '12px 16px', verticalAlign: 'top', maxWidth: 500 }}>
                                  {item.comments ? (
                                    <div style={{ 
                                      fontSize: 13, 
                                      lineHeight: 1.6,
                                      color: '#374151',
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word'
                                    }}>
                                      {item.comments}
                                    </div>
                                  ) : (
                                    <span style={{ color: '#9ca3af' }}>-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Bottom Pagination Controls */}
                        {totalPages > 1 && (
                          <div style={{ 
                            marginTop: 16, 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              style={{
                                ...buttonStyles.secondary,
                                padding: '6px 12px',
                                fontSize: 13,
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Previous
                            </button>
                            
                            {/* Page numbers - compact view */}
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              {(() => {
                                const pages = [];
                                const maxPagesToShow = 5;
                                
                                if (totalPages <= maxPagesToShow + 2) {
                                  // Show all pages if total is small
                                  for (let i = 1; i <= totalPages; i++) {
                                    pages.push(i);
                                  }
                                } else {
                                  // Always show first page
                                  pages.push(1);
                                  
                                  if (currentPage > 3) {
                                    pages.push('...');
                                  }
                                  
                                  // Show pages around current
                                  const start = Math.max(2, currentPage - 1);
                                  const end = Math.min(totalPages - 1, currentPage + 1);
                                  
                                  for (let i = start; i <= end; i++) {
                                    if (!pages.includes(i)) {
                                      pages.push(i);
                                    }
                                  }
                                  
                                  if (currentPage < totalPages - 2) {
                                    pages.push('...');
                                  }
                                  
                                  // Always show last page
                                  if (!pages.includes(totalPages)) {
                                    pages.push(totalPages);
                                  }
                                }
                                
                                return pages.map((pageNum, idx) => {
                                  if (pageNum === '...') {
                                    return (
                                      <span key={`ellipsis-${idx}`} style={{ 
                                        padding: '6px 4px',
                                        fontSize: 13,
                                        color: '#9ca3af'
                                      }}>
                                        ...
                                      </span>
                                    );
                                  }
                                  
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentPage(pageNum as number)}
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: currentPage === pageNum ? '#ffffff' : '#6b7280',
                                        backgroundColor: currentPage === pageNum ? '#1f2937' : 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        minWidth: 36,
                                      }}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                            
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              style={{
                                ...buttonStyles.secondary,
                                padding: '6px 12px',
                                fontSize: 13,
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
              </CardContent>
            </Card>
          )}

          {/* Agent Briefing - Two Columns */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>
                Agent Briefing
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                Analysis of customer feedback patterns
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Negative Feedback Agent */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                    👎 Negative Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {negativeAgentLoading ? (
                    <div>Loading...</div>
                  ) : negativeAgentResponse ? (
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                      {JSON.stringify(negativeAgentResponse, null, 2)}
                    </pre>
                  ) : (
                    <div>No data</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Positive Feedback Agent */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#16a34a' }}>
                    👍 Positive Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {positiveAgentLoading ? (
                    <div>Loading...</div>
                  ) : positiveAgentResponse ? (
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                      {JSON.stringify(positiveAgentResponse, null, 2)}
                    </pre>
                  ) : (
                    <div>No data</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* API Calls - Collapsible */}
          <Card style={{ marginBottom: 32, background: '#fafafa', borderColor: '#e5e7eb' }}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>API Calls</CardTitle>
                <button
                  onClick={() => setShowApiCalls(!showApiCalls)}
                  style={{
                    ...buttonStyles.secondary,
                    padding: '6px 12px',
                    fontSize: 13,
                  }}
                >
                  {showApiCalls ? 'Hide' : 'Show'} API Calls
                </button>
              </div>
            </CardHeader>
            {showApiCalls && (
              <CardContent>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Negative Feedback API Call */}
                    <div style={{ 
                      border: '2px solid #fca5a5', 
                      borderRadius: 8, 
                      padding: 16,
                      background: '#fef2f2'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <strong style={{ fontSize: 14, color: '#991b1b' }}>👎 Negative Feedback API</strong>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(negativeApiCall, null, 2));
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: 11,
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          Copy JSON
                        </button>
                      </div>
                      <pre style={{ 
                        background: 'white', 
                        padding: 12,
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        maxHeight: 300,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {negativeApiCall ? JSON.stringify(negativeApiCall, null, 2) : 'Loading...'}
                      </pre>
                      <p style={{ marginTop: 8, fontSize: 12, color: '#991b1b' }}>
                        Found: {metrics.negativeCount} items
                      </p>
                    </div>
                    
                    {/* Positive Feedback API Call */}
                    <div style={{ 
                      border: '2px solid #86efac', 
                      borderRadius: 8, 
                      padding: 16,
                      background: '#f0fdf4'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <strong style={{ fontSize: 14, color: '#166534' }}>👍 Positive Feedback API</strong>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(positiveApiCall, null, 2));
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: 11,
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          Copy JSON
                        </button>
                      </div>
                      <pre style={{ 
                        background: 'white', 
                        padding: 12,
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        maxHeight: 300,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {positiveApiCall ? JSON.stringify(positiveApiCall, null, 2) : 'Loading...'}
                      </pre>
                      <p style={{ marginTop: 8, fontSize: 12, color: '#166534' }}>
                        Found: {metrics.positiveCount} items
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
                    <strong>Total Results:</strong> {metrics.totalFeedback} items
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}

      {/* Raw JSON Debug Section */}
      <Card style={{ marginTop: 32, background: '#fafafa', borderColor: '#e5e7eb' }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Debug: Raw API Responses</CardTitle>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              style={{
                ...buttonStyles.secondary,
                padding: '6px 12px',
                fontSize: 13,
              }}
            >
              {showRawJson ? 'Hide' : 'Show'} Raw JSON
            </button>
          </div>
        </CardHeader>
        {showRawJson && (
          <CardContent>
            {rawResponse ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Negative Response */}
                <div>
                  <h3 style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#dc2626', 
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>👎 Negative Feedback Response</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(rawResponse.negative, null, 2));
                        const btn = event?.target as HTMLButtonElement;
                        const originalText = btn.textContent;
                        btn.textContent = '✓ Copied!';
                        setTimeout(() => {
                          btn.textContent = originalText || 'Copy';
                        }, 2000);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#dc2626',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #dc2626',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      Copy
                    </button>
                  </h3>
                  <div style={{
                    background: '#1f2937',
                    color: '#10b981',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 500,
                    fontSize: 11,
                    fontFamily: 'Monaco, Menlo, monospace',
                    lineHeight: 1.5,
                  }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(rawResponse.negative, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Positive Response */}
                <div>
                  <h3 style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#16a34a', 
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>👍 Positive Feedback Response</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(rawResponse.positive, null, 2));
                        const btn = event?.target as HTMLButtonElement;
                        const originalText = btn.textContent;
                        btn.textContent = '✓ Copied!';
                        setTimeout(() => {
                          btn.textContent = originalText || 'Copy';
                        }, 2000);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#16a34a',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #16a34a',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      Copy
                    </button>
                  </h3>
                  <div style={{
                    background: '#1f2937',
                    color: '#10b981',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 500,
                    fontSize: 11,
                    fontFamily: 'Monaco, Menlo, monospace',
                    lineHeight: 1.5,
                  }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(rawResponse.positive, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: 14 }}>No data available yet. Try refreshing the page.</p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function SentimentDashboard() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <RefreshCw size={32} color="#343ced" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <SentimentDashboardContent />
    </Suspense>
  );
}
