import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import type { UserData } from '../api';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-3xl">💪</span>
        </div>
        <p className="text-lg font-medium text-foreground">
          Completing sign-in…
        </p>
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    </div>
  );
}
