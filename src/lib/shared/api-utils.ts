/**
 * Centralized API utilities
 * Consolidates duplicate API handling functions across the codebase
 */

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request configuration
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// API utilities
export const apiUtils = {
  // Create headers with common defaults
  createHeaders: (
    token?: string,
    additionalHeaders?: Record<string, string>
  ) => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...additionalHeaders,
  }),

  // Handle API responses with proper error handling
  handleResponse: async <T = any>(response: Response): Promise<T> => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new Error('Failed to parse response');
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || `HTTP ${response.status}`,
        status: response.status,
        code: data?.code,
        details: data?.details,
      };
      throw error;
    }

    return data;
  },

  // Create request with timeout and retry logic
  createRequest: async <T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions: RequestInit = {
      method,
      headers: apiUtils.createHeaders(undefined, headers),
      signal: controller.signal,
      ...(body && { body: JSON.stringify(body) }),
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        return await apiUtils.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          if (
            (error as ApiError).status >= 400 &&
            (error as ApiError).status < 500
          ) {
            throw error; // Client errors shouldn't be retried
          }
        }

        // Wait before retry (except on last attempt)
        if (attempt < retries) {
          await new Promise(resolve =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError!;
  },

  // GET request
  get: <T = any>(
    url: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ) => apiUtils.createRequest<T>(url, { ...config, method: 'GET' }),

  // POST request
  post: <T = any>(
    url: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ) => apiUtils.createRequest<T>(url, { ...config, method: 'POST', body }),

  // PUT request
  put: <T = any>(
    url: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ) => apiUtils.createRequest<T>(url, { ...config, method: 'PUT', body }),

  // PATCH request
  patch: <T = any>(
    url: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ) => apiUtils.createRequest<T>(url, { ...config, method: 'PATCH', body }),

  // DELETE request
  delete: <T = any>(
    url: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ) => apiUtils.createRequest<T>(url, { ...config, method: 'DELETE' }),

  // Build query string from object
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  },

  // Build URL with query parameters
  buildUrl: (baseUrl: string, params?: Record<string, any>): string => {
    if (!params) return baseUrl;
    return baseUrl + apiUtils.buildQueryString(params);
  },

  // Check if error is an API error
  isApiError: (error: any): error is ApiError => {
    return (
      error &&
      typeof error.status === 'number' &&
      typeof error.message === 'string'
    );
  },

  // Format error for display
  formatError: (error: any): string => {
    if (apiUtils.isApiError(error)) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Batch requests with concurrency control
  batchRequests: async <T = any>(
    requests: Array<() => Promise<T>>,
    concurrency = 5
  ): Promise<T[]> => {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  },
};

// Export individual functions for convenience
export const {
  createHeaders,
  handleResponse,
  createRequest,
  get,
  post,
  put,
  patch,
  delete: del,
  buildQueryString,
  buildUrl,
  isApiError,
  formatError,
  batchRequests,
} = apiUtils;
