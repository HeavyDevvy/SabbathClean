import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient, type User } from "@/lib/auth-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch current user on mount
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const currentUser = await authClient.getCurrentUser();
      setIsInitialized(true);
      return currentUser;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await authClient.login({ email, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      refetch();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await authClient.register(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.logout();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.clear(); // Clear all cached data on logout
      refetch();
    },
  });

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    login: async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    register: async (data: any) => {
      await registerMutation.mutateAsync(data);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refreshUser: () => {
      refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
