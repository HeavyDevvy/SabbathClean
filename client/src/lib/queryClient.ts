import { QueryClient, QueryFunction } from "@tanstack/react-query";

function getApiBaseUrl(): string {
  const env = (import.meta as any).env || {};
  const v = env.NEXT_PUBLIC_API_BASE_URL || env.VITE_API_BASE_URL;
  if (v && typeof v === "string" && v.length > 0) return v;
  if (typeof window !== "undefined") return "";
  return "";
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const data = await res.clone().json();
      const message =
        (data && (data.message || data.error)) ||
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        res.statusText;
      throw new Error(message);
    } catch {
      const text = (await res.text()) || res.statusText;
      const cleaned = text.startsWith('{') ? res.statusText : text;
      const fallback = res.status === 409 ? 'Email already registered' : cleaned;
      throw new Error(fallback);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add authorization header if token exists
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const fullUrl = url.startsWith("/api") ? `${getApiBaseUrl()}${url}` : url;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add authorization header if token exists
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const key = (queryKey[0] as string) || "";
    const fullUrl = key.startsWith("/api") ? `${getApiBaseUrl()}${key}` : key;
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for quick access
      retry: 1, // Single retry for failed requests
      retryDelay: 500, // 500ms delay between retries
    },
    mutations: {
      retry: 1, // Single retry for failed mutations
      retryDelay: 500,
    },
  },
});
