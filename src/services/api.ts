// API Service for Backend Integration

const API_BASE_URL = 'https://localhost:7159/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private accessToken: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('accessToken');
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle no content responses
      if (response.status === 204) {
        return { status: response.status };
      }

      // Try to parse JSON response
      let data: T | undefined;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // Empty response body
        }
      }

      if (!response.ok) {
        const errorMessage = (data as any)?.message || (data as any)?.title || 'Erro na requisição';
        return { error: errorMessage, status: response.status };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API request error:', error);
      return { 
        error: 'Erro de conexão. Verifique se o servidor está rodando.', 
        status: 0 
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export type { ApiResponse };
