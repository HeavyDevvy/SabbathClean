import { QueryClient, QueryFunction } from "@tanstack/react-query";

function getApiBaseUrl(): string {
  const env = (import.meta as any).env || {};
  const loc = typeof window !== "undefined" ? window.location.origin : "";
  const isDev = !!env.DEV;
  if (isDev || (loc && loc.includes("localhost"))) return "";
  const v = env.NEXT_PUBLIC_API_BASE_URL || env.VITE_API_BASE_URL || env.APP_BASE_URL;
  return v && typeof v === "string" && v.length > 0 ? v : "";
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

  const base = getApiBaseUrl();
  const fullUrl = url.startsWith("/api") ? (base ? `${base}${url}` : url) : url;
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  } catch (err) {
    if (url.startsWith("/api") && base) {
      const res2 = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      await throwIfResNotOk(res2);
      return res2;
    }
    throw err;
  }
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
    const base = getApiBaseUrl();
    const fullUrl = key.startsWith("/api") ? (base ? `${base}${key}` : key) : key;
    try {
      const res = await fetch(fullUrl, {
        headers,
        credentials: "include",
      });
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as any;
      }
      await throwIfResNotOk(res);
      return await res.json();
    } catch (err) {
      if (key.startsWith("/api") && base) {
        const res2 = await fetch(key, {
          headers,
          credentials: "include",
        });
        if (unauthorizedBehavior === "returnNull" && res2.status === 401) {
          return null as any;
        }
        await throwIfResNotOk(res2);
        return await res2.json();
      }
      throw err;
    }
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
