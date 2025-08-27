import { useState, useEffect, createContext, useContext } from 'react';
import { authClient } from '@/lib/auth-client';
import type { User } from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // If not in provider, return standalone hook
    return useAuthStandalone();
  }
  return context;
}

// Standalone hook for when not using provider
function useAuthStandalone() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const result = await authClient.login({ email, password, rememberMe });
    setUser(result.user);
  };

  const logout = async () => {
    await authClient.logout();
    setUser(null);
  };

  const refetchUser = async () => {
    try {
      const currentUser = await authClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refetching user:', error);
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetchUser,
  };
}