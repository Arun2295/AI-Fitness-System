import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import type { UserData } from '../api';

/**
 * Landing page for OAuth2 redirect:
 * http://localhost:3000/oauth2/callback?refreshToken=...&profileComplete=...
 *
 * The backend sends the user back here after Google login.
 * We store the refresh token and then fetch profile from cookie-protected API.
 *
 * IMPORTANT: Use relative URL (/api/users/me) so Vite dev proxy forwards it
 * to localhost:8081 with the correct cookie — direct cross-origin fetch would
 * be blocked by the browser's SameSite cookie policy.
 */
export default function OAuth2CallbackPage() {
  const [params] = useSearchParams();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!refreshToken) {
      console.error('[OAuth2Callback] No refreshToken in URL params');
      navigate('/login');
      return;
    }

    // Use relative URL so Vite proxy sends the request to localhost:8081
    // while preserving the accessToken cookie that was set by the backend.
    fetch('/api/users/me', {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => 'no body');
          console.error(`[OAuth2Callback] /api/users/me returned ${res.status}: ${text}`);
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<UserData>;
      })
      .then((user) => {
        // Backend enums serialize to their name string — normalise
        const normalised: UserData = {
          ...user,
          role: typeof user.role === 'string' ? user.role : String(user.role),
          gender: typeof user.gender === 'string' ? user.gender : String(user.gender ?? ''),
          goal: typeof user.goal === 'string' ? user.goal : String(user.goal ?? ''),
          activityLevel: typeof user.activityLevel === 'string'
            ? user.activityLevel
            : String(user.activityLevel ?? ''),
        };
        setAuth(normalised, refreshToken);
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('[OAuth2Callback] Failed to fetch user profile:', err);
        navigate(`/login?error=${encodeURIComponent('Google sign-in succeeded but profile load failed. Please try again.')}`);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          Completing sign-in…
        </p>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
          margin: '24px auto 0',
        }} />
      </div>
    </div>
  );
}

