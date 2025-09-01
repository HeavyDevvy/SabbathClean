import { apiRequest } from './queryClient';

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  profileImage?: string;
  isProvider: boolean;
  preferences?: any;
  notificationSettings?: any;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export class AuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization (only in browser)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json() as AuthResponse;
      
      // Store tokens
      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken || null;
      
      localStorage.setItem('accessToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest('POST', '/api/auth/register', data);
      const result = await response.json() as AuthResponse;
      
      // Store tokens
      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken || null;
      
      localStorage.setItem('accessToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.accessToken) {
        return null;
      }

      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        if (this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.getCurrentUser(); // Retry with new token
          }
        }
        
        // Refresh failed or no refresh token, clear tokens
        this.clearTokens();
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token');
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        if (this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.updateProfile(data); // Retry with new token
          }
        }
        
        // Refresh failed, clear tokens and throw
        this.clearTokens();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if server request fails
    } finally {
      this.clearTokens();
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      this.accessToken = result.accessToken;
      localStorage.setItem('accessToken', result.accessToken);

      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Export singleton instance
export const authClient = new AuthClient();