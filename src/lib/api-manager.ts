import type { ApiConfig } from '@/types';

export class ApiManager {
  private configs: Map<string, ApiConfig> = new Map();

  constructor(initialConfigs?: ApiConfig[]) {
    if (initialConfigs) {
      initialConfigs.forEach(config => this.addConfig(config));
    }
  }

  addConfig(config: ApiConfig): void {
    this.configs.set(config.name, config);
  }

  getConfig(name: string): ApiConfig | undefined {
    return this.configs.get(name);
  }

  getAllConfigs(): ApiConfig[] {
    return Array.from(this.configs.values());
  }

  removeConfig(name: string): boolean {
    return this.configs.delete(name);
  }

  async makeRequest<T>(
    configName: string,
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const config = this.getConfig(configName);
    if (!config) {
      throw new Error(`API config not found: ${configName}`);
    }

    const url = `${config.endpoint}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Handle Glean Client API Token (with GLEAN_AUTH_TOKEN_ prefix)
    // Note: Do NOT include X-Glean-Auth-Type header for Client API tokens
    if (config.authType === 'oauth' && config.oauthToken) {
      headers['Authorization'] = `Bearer ${config.oauthToken}`;
      // Only add X-Glean-Auth-Type for real OAuth tokens from IdP (not Client API tokens)
      // Client API tokens have GLEAN_AUTH_TOKEN_ prefix and don't need this header
    } 
    // Handle API Key authentication (fallback)
    else if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    return response.json();
  }
}

// Singleton instance
let apiManagerInstance: ApiManager | null = null;

export function getApiManager(): ApiManager {
  if (!apiManagerInstance) {
    apiManagerInstance = new ApiManager();
  }
  return apiManagerInstance;
}

export function initializeApiManager(configs: ApiConfig[]): void {
  apiManagerInstance = new ApiManager(configs);
}
