import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const GOAL_LABELS: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  WEIGHT_GAIN: 'Weight Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
  GENERAL_FITNESS: 'General Fitness',
  STRENGTH: 'Strength',
  ENDURANCE: 'Endurance',
  CARDIO: 'Cardio',
  FLEXIBILITY: 'Flexibility',
  BODYBUILDING: 'Bodybuilding',
};

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: 'Sedentary',
  LIGHTLY_ACTIVE: 'Lightly Active',
  MODERATELY_ACTIVE: 'Moderately Active',
  VERY_ACTIVE: 'Very Active',
  EXTRA_ACTIVE: 'Extra Active',
};

const GOAL_ICONS: Record<string, string> = {
  WEIGHT_LOSS: '🔥',
  WEIGHT_GAIN: '💪',
  MAINTAIN_WEIGHT: '⚖️',
  GENERAL_FITNESS: '🏃',
  STRENGTH: '🏋️',
  ENDURANCE: '🚴',
  CARDIO: '💓',
  FLEXIBILITY: '🧘',
  BODYBUILDING: '🏆',
};

function bmi(height: number, weight: number) {
  if (!height || !weight) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiCategory(bmiVal: number) {
  if (bmiVal < 18.5) return { label: 'Underweight', color: '#60a5fa' };
  if (bmiVal < 25)   return { label: 'Normal', color: '#34d399' };
  if (bmiVal < 30)   return { label: 'Overweight', color: '#fbbf24' };
  return { label: 'Obese', color: '#f87171' };
}

export default function DashboardPage() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clearAuth();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const bmiVal = bmi(user.height ?? 0, user.weight ?? 0);
  const bmiInfo = bmiVal ? bmiCategory(parseFloat(bmiVal)) : null;
  const firstName = user.name?.split(' ')[0] || 'User';
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const stats = [
    { icon: '⚖️', label: 'Weight', value: user.weight != null ? `${user.weight} kg` : '—', change: 'Current' },
    { icon: '📏', label: 'Height', value: user.height != null ? `${user.height} cm` : '—', change: 'Recorded' },
    { icon: '🎂', label: 'Age', value: user.age ? `${user.age} yrs` : '—', change: 'Current' },
    { icon: '📊', label: 'BMI', value: bmiVal ?? '—', change: bmiInfo?.label ?? 'Not set' },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💪</div>
          <span className="sidebar-logo-text">AI Fitness</span>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="#dashboard">
            <span className="nav-icon">🏠</span> Dashboard
          </a>
          <a className="nav-item" href="#dashboard">
            <span className="nav-icon">📈</span> Progress
          </a>
          <a className="nav-item" href="#dashboard">
            <span className="nav-icon">🥗</span> Nutrition
          </a>
          <a className="nav-item" href="#dashboard">
            <span className="nav-icon">🏋️</span> Workouts
          </a>
          <a className="nav-item" href="#dashboard">
            <span className="nav-icon">🎯</span> Goals
          </a>
          <a className="nav-item" href="#dashboard">
            <span className="nav-icon">⚙️</span> Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <button
            id="btn-sidebar-logout"
            className="nav-item"
            onClick={handleLogout}
            style={{ color: '#f87171', width: '100%' }}
          >
            <span className="nav-icon">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <p className="topbar-greeting">
              Good day, <strong>{firstName}</strong> 👋
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-accent">
              {GOAL_ICONS[user.goal] || '🎯'} {GOAL_LABELS[user.goal] || user.goal}
            </span>
            <button
              id="btn-top-logout"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Page header */}
        <div className="page-header">
          <h1 className="page-title">Your Fitness Dashboard</h1>
          <p className="page-subtitle">
            Track your progress and stay on target.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.label === 'BMI' && bmiInfo && (
                <div className="stat-change" style={{ color: bmiInfo.color }}>
                  {bmiInfo.label}
                </div>
              )}
              {s.label !== 'BMI' && (
                <div className="stat-change">{s.change}</div>
              )}
            </div>
          ))}
        </div>

        {/* Profile section */}
        <div className="profile-section">
          {/* Profile Card */}
          <div className="card">
            <h2 className="card-title">👤 Profile</h2>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <span className="badge badge-accent" style={{ marginBottom: 20 }}>
              {user.role}
            </span>
            <ul className="info-list" style={{ marginTop: 16 }}>
              <li className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{user.phoneNumber || '—'}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{user.gender || '—'}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{user.age ? `${user.age} years` : '—'}</span>
              </li>
            </ul>
          </div>

          {/* Fitness Info Card */}
          <div className="card">
            <h2 className="card-title">🏋️ Fitness Profile</h2>
            <ul className="info-list">
              <li className="info-item">
                <span className="info-label">Goal</span>
                <span className="info-value">
                  {GOAL_ICONS[user.goal] || ''} {GOAL_LABELS[user.goal] || user.goal || '—'}
                </span>
              </li>
              <li className="info-item">
                <span className="info-label">Activity Level</span>
                <span className="info-value">{ACTIVITY_LABELS[user.activityLevel] || user.activityLevel || '—'}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Height</span>
                <span className="info-value">{user.height ? `${user.height} cm` : '—'}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value">{user.weight ? `${user.weight} kg` : '—'}</span>
              </li>
              <li className="info-item">
                <span className="info-label">BMI</span>
                <span className="info-value" style={{ color: bmiInfo?.color }}>
                  {bmiVal ?? '—'} {bmiInfo ? `(${bmiInfo.label})` : ''}
                </span>
              </li>
            </ul>

            {/* BMI bar */}
            {bmiVal && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>
                  BMI Range
                </div>
                <div style={{
                  height: 8, borderRadius: 4, overflow: 'hidden',
                  background: 'linear-gradient(to right, #60a5fa 0%, #34d399 37.5%, #fbbf24 62.5%, #f87171 100%)'
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: bmiInfo?.color ?? '#34d399',
                    border: '2px solid white',
                    marginTop: -2,
                    marginLeft: `${Math.min(Math.max(((parseFloat(bmiVal) - 15) / 25) * 100, 0), 96)}%`,
                    transition: 'margin-left 0.5s ease',
                    boxShadow: `0 0 8px ${bmiInfo?.color}80`,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="card-title">⚡ Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: '📝', label: 'Log Workout' },
              { icon: '🥗', label: 'Log Meal' },
              { icon: '⚖️', label: 'Update Weight' },
              { icon: '💤', label: 'Log Sleep' },
              { icon: '💧', label: 'Log Water' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="btn btn-outline"
                style={{ padding: '10px 20px', fontSize: 14 }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
