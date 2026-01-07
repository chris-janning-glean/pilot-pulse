import type { ApiConfig, DashboardConfig } from '@/types';

export const DEFAULT_API_CONFIGS: ApiConfig[] = [
  {
    name: 'glean',
    endpoint: process.env.NEXT_PUBLIC_GLEAN_API_ENDPOINT || 'https://scio-prod-be.glean.com',
    authType: 'oauth', // Using Glean Client API Token (not real OAuth from IdP)
    oauthToken: process.env.NEXT_PUBLIC_GLEAN_OAUTH_TOKEN,
    headers: {
      'Content-Type': 'application/json',
    },
  },
];

export const DASHBOARD_CONFIGS: DashboardConfig[] = [
  {
    id: 'sentiment',
    name: 'User Sentiment',
    description: 'Monitor user feedback and sentiment from thumbs up/down interactions',
    icon: 'ThumbsUp',
    path: '/dashboard/sentiment',
    apiConfigs: ['glean'],
  },
  // Future dashboards can be added here
  // {
  //   id: 'adoption',
  //   name: 'Adoption Metrics',
  //   description: 'Track user adoption and engagement metrics',
  //   icon: 'TrendingUp',
  //   path: '/dashboard/adoption',
  //   apiConfigs: ['glean'],
  // },
];

export function getApiConfig(name: string): ApiConfig | undefined {
  return DEFAULT_API_CONFIGS.find(config => config.name === name);
}

export function getDashboardConfig(id: string): DashboardConfig | undefined {
  return DASHBOARD_CONFIGS.find(config => config.id === id);
}
