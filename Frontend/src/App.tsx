import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import NutritionPage from './pages/NutritionPage';
import NutritionKnowledgePage from './pages/NutritionKnowledgePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />

      <Route path="/nutrition" element={
        <ProtectedRoute><NutritionPage /></ProtectedRoute>
      } />

      <Route path="/knowledge" element={
        <ProtectedRoute><NutritionKnowledgePage /></ProtectedRoute>
      } />

      {/* OAuth2 callback from backend */}
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
      <Route path="/oauth2/redirect" element={<OAuth2CallbackPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="dark min-h-screen bg-background text-foreground font-sans antialiased">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
