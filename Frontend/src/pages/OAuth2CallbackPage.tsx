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
      navigate('/login');
      return;
    }

    // The access token was set as a cookie by the backend.
    // Fetch current user profile using that cookie.
    fetch('http://localhost:8081/api/users/me', {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json() as Promise<UserData>;
      })
      .then((user) => {
        setAuth(user, refreshToken);
        navigate('/dashboard');
      })
      .catch(() => {
        // If /api/users/me doesn't exist yet, create minimal user from token
        // and redirect to dashboard anyway — the backend cookie is set.
        navigate('/login?error=Profile+fetch+failed.+Please+log+in+again.');
      });
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
