import { ApiResponse, PaginatedResponse, Property, User, SavedSearch, Favorite, Notification, ValuationRequest, MoveoutRequest, SearchCriteria, UserPreferences } from '@/types/database';
import {
  mockGetProperties,
  mockGetProperty,
  mockGetFavorites,
  mockAddFavorite,
  mockRemoveFavorite,
} from '@/lib/mockApi';

// API ベースURL（環境変数から取得）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// バックエンド接続モード: 'mock' | 'api'
// バックエンドが起動していない場合は 'mock' を使用
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'API request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // 認証関連
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // 物件関連
  async getProperties(params?: {
    page?: number;
    limit?: number;
    search?: SearchCriteria;
  }): Promise<ApiResponse<PaginatedResponse<Property>>> {
    if (USE_MOCK) {
      return mockGetProperties(params || {});
    }
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) {
      Object.entries(params.search).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    return this.request(`/properties?${queryParams.toString()}`);
  }

  async getProperty(id: string): Promise<ApiResponse<Property>> {
    if (USE_MOCK) {
      return mockGetProperty(id);
    }
    return this.request(`/properties/${id}`);
  }

  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Property>> {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<ApiResponse<Property>> {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  }

  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // お気に入り関連
  async getFavorites(): Promise<ApiResponse<Property[]>> {
    if (USE_MOCK) return mockGetFavorites();
    return this.request('/favorites');
  }

  async addFavorite(propertyId: string): Promise<ApiResponse<Favorite>> {
    if (USE_MOCK) return mockAddFavorite(propertyId) as Promise<ApiResponse<Favorite>>;
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  }

  async removeFavorite(propertyId: string): Promise<ApiResponse<void>> {
    if (USE_MOCK) return mockRemoveFavorite(propertyId);
    return this.request(`/favorites/${propertyId}`, {
      method: 'DELETE',
    });
  }

  // 保存された検索条件
  async getSavedSearches(): Promise<ApiResponse<SavedSearch[]>> {
    return this.request('/saved-searches');
  }

  async saveSearch(name: string, criteria: SearchCriteria): Promise<ApiResponse<SavedSearch>> {
    return this.request('/saved-searches', {
      method: 'POST',
      body: JSON.stringify({ name, searchCriteria: criteria }),
    });
  }

  async updateSavedSearch(id: string, name: string, criteria: SearchCriteria): Promise<ApiResponse<SavedSearch>> {
    return this.request(`/saved-searches/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, searchCriteria: criteria }),
    });
  }

  async deleteSavedSearch(id: string): Promise<ApiResponse<void>> {
    return this.request(`/saved-searches/${id}`, {
      method: 'DELETE',
    });
  }

  // 通知関連
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // 査定依頼
  async submitValuationRequest(request: Omit<ValuationRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ValuationRequest>> {
    return this.request('/valuation-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getValuationRequests(): Promise<ApiResponse<ValuationRequest[]>> {
    return this.request('/valuation-requests');
  }

  // 退去申請
  async submitMoveoutRequest(request: Omit<MoveoutRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MoveoutRequest>> {
    return this.request('/moveout-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getMoveoutRequests(): Promise<ApiResponse<MoveoutRequest[]>> {
    return this.request('/moveout-requests');
  }

  // ユーザー設定
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request('/user/profile');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
