// API Service for Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tmoney.onrender.com/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Map backend errors to safe user-friendly messages
const sanitizeErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
      return 'Acesso não autorizado. Faça login novamente.';
    }
    if (lowerError.includes('forbidden') || lowerError.includes('403')) {
      return 'Você não tem permissão para esta ação.';
    }
    if (lowerError.includes('not found') || lowerError.includes('404')) {
      return 'Recurso não encontrado.';
    }
    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return 'Dados inválidos. Verifique as informações.';
    }
    if (lowerError.includes('conflict') || lowerError.includes('409')) {
      return 'Este registro já existe.';
    }
    if (lowerError.includes('server') || lowerError.includes('500')) {
      return 'Erro interno. Tente novamente mais tarde.';
    }
  }
  return 'Erro ao processar requisição.';
};

class ApiService {
  private accessToken: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem("accessToken");
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
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
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          // Empty response body
        }
      }

      if (!response.ok) {
        // Sanitize error messages to prevent information leakage
        const rawError = (data as any)?.message || (data as any)?.title || "";
        const errorMessage = sanitizeErrorMessage(rawError);
        return { error: errorMessage, status: response.status };
      }

      return { data, status: response.status };
    } catch {
      // Generic connection error - don't expose technical details
      return {
        error: "Erro de conexão. Verifique sua internet e tente novamente.",
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiService();
export type { ApiResponse };
