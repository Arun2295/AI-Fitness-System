// Central API configuration and service
const API_BASE = ''; // Vite dev proxy forwards /api and /oauth2 to localhost:8081

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      const msg = data?.message || data?.error || `Error ${res.status}`;
      return { error: msg };
    }

    return { data };
  } catch (err: any) {
    return { error: err.message || 'Network error — is the server running?' };
  }
}

// ── Auth ──────────────────────────────────────────────────
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  height: number;
  weight: number;
  age: number;
  activityLevel: string;
  goal: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  gender: string | null;
  height: number | null;
  weight: number | null;
  age: number;
  activityLevel: string | null;
  goal: string | null;
}

export interface AuthData {
  refreshToken: string;
  tokenType: string;
  accessTokenExpiration: number;
  refreshTokenExpiration: number;
  user: UserData;
  profileComplete: boolean;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthData>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<AuthData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),

  googleLogin: () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  },
};
