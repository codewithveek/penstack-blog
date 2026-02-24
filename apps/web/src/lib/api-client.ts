/**
 * Typed API client for the Hono backend.
 * All frontend code must use these helpers — never raw fetch() with hardcoded URLs.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? "http://localhost:3100")
    : "");

// ---------------------------------------------------------------------------
// Low-level fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: { code: string; message: string };
}

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, headers, ...rest } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  const res = await fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    },
    body: body !== undefined ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    let errBody: Partial<ApiError> = {};
    try {
      errBody = (await res.json()) as Partial<ApiError>;
    } catch {
      /* ignore parse failures */
    }
    throw new ApiRequestError(
      errBody.error?.code ?? "UNKNOWN",
      errBody.error?.message ?? res.statusText,
      res.status
    );
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

// ---------------------------------------------------------------------------
// Typed helpers
// ---------------------------------------------------------------------------

export const api = {
  get<T>(path: string, params?: RequestOptions["params"]): Promise<T> {
    return params
      ? request<T>(path, { method: "GET", params })
      : request<T>(path, { method: "GET" });
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "PATCH", body });
  },
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "PUT", body });
  },
  delete<T = void>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Domain-specific helpers
// ---------------------------------------------------------------------------

// Auth
export const authApi = {
  adminLogin: (email: string, password: string) =>
    api.post<{ token: string }>("/api/admin/v1/auth/login", {
      email,
      password,
    }),
  adminLogout: () => api.post("/api/admin/v1/auth/logout"),
  sendMagicLink: (email: string) =>
    api.post("/api/content/v1/auth/magic-link", { email }),
  verifyMagicLink: (token: string) =>
    api.post<{ member: unknown }>("/api/content/v1/auth/magic-link/verify", {
      token,
    }),
  me: () =>
    api.get<{ id: string; name: string; email: string; role: string }>(
      "/api/admin/v1/auth/me"
    ),
};

// Setup
export const setupApi = {
  status: () =>
    api.get<{ completed: boolean; steps: string[] }>(
      "/api/admin/v1/setup/status"
    ),
  complete: (data: unknown) => api.post("/api/admin/v1/setup/complete", data),
};

// Posts
export const postsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ items: unknown[]; meta: unknown }>("/api/admin/v1/posts", params),
  get: (id: string) => api.get<unknown>(`/api/admin/v1/posts/${id}`),
  create: (data: unknown) => api.post<unknown>("/api/admin/v1/posts", data),
  update: (id: string, data: unknown) =>
    api.patch<unknown>(`/api/admin/v1/posts/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/v1/posts/${id}`),
  publish: (id: string) =>
    api.post<unknown>(`/api/admin/v1/posts/${id}/publish`),
  unpublish: (id: string) =>
    api.post<unknown>(`/api/admin/v1/posts/${id}/unpublish`),
};

// Pages
export const pagesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<{ items: unknown[]; meta: unknown }>("/api/admin/v1/pages", params),
  get: (id: string) => api.get<unknown>(`/api/admin/v1/pages/${id}`),
  create: (data: unknown) => api.post<unknown>("/api/admin/v1/pages", data),
  update: (id: string, data: unknown) =>
    api.patch<unknown>(`/api/admin/v1/pages/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/v1/pages/${id}`),
};

// Tags
export const tagsApi = {
  list: () => api.get<unknown[]>("/api/admin/v1/tags"),
  create: (data: unknown) => api.post<unknown>("/api/admin/v1/tags", data),
  update: (id: string, data: unknown) =>
    api.patch<unknown>(`/api/admin/v1/tags/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/v1/tags/${id}`),
};

// Members
export const membersApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ items: unknown[]; meta: unknown }>(
      "/api/admin/v1/members",
      params
    ),
  get: (id: string) => api.get<unknown>(`/api/admin/v1/members/${id}`),
  delete: (id: string) => api.delete(`/api/admin/v1/members/${id}`),
};

// Media
export const mediaApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<{ items: unknown[]; meta: unknown }>("/api/admin/v1/media", params),
  delete: (id: string) => api.delete(`/api/admin/v1/media/${id}`),
  getUploadToken: (data: {
    filename: string;
    mimeType: string;
    size: number;
  }) =>
    api.post<{ uploadUrl: string; key: string; mediaId: string }>(
      "/api/admin/v1/media/upload-token",
      data
    ),
};

// Settings
export const settingsApi = {
  getSite: () => api.get<unknown>("/api/admin/v1/settings/site"),
  updateSite: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/site", data),
  getAuth: () => api.get<unknown>("/api/admin/v1/settings/auth"),
  updateAuth: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/auth", data),
  getEmail: () => api.get<unknown>("/api/admin/v1/settings/email"),
  updateEmail: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/email", data),
};

// Settings — per-tab helpers used by individual settings tabs
export const authSettingsApi = {
  get: () => api.get<unknown>("/api/admin/v1/settings/auth"),
  update: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/auth", data),
};

export const memberSettingsApi = {
  get: () => api.get<unknown>("/api/admin/v1/settings/members"),
  update: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/members", data),
};

export const designSettingsApi = {
  get: () => api.get<unknown>("/api/admin/v1/settings/design"),
  update: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/design", data),
};

export const integrationsSettingsApi = {
  get: () => api.get<unknown>("/api/admin/v1/settings/integrations"),
  update: (data: unknown) =>
    api.patch<unknown>("/api/admin/v1/settings/integrations", data),
};

// Newsletters
export const newslettersApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<{ items: unknown[]; meta: unknown }>(
      "/api/admin/v1/newsletters",
      params
    ),
  get: (id: string) => api.get<unknown>(`/api/admin/v1/newsletters/${id}`),
  create: (data: unknown) =>
    api.post<unknown>("/api/admin/v1/newsletters", data),
  update: (id: string, data: unknown) =>
    api.patch<unknown>(`/api/admin/v1/newsletters/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/v1/newsletters/${id}`),
};

// Users
export const usersApi = {
  list: () => api.get<unknown[]>("/api/admin/v1/users"),
  invite: (data: unknown) =>
    api.post<unknown>("/api/admin/v1/users/invite", data),
  update: (id: string, data: unknown) =>
    api.patch<unknown>(`/api/admin/v1/users/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/v1/users/${id}`),
};
