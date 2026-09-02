import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

import LoginPage from './pages/LoginPage';

import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { ProjectUpdatesPage } from './pages/ProjectUpdatesPage';
import { AlertsPage } from './pages/AlertsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('inframonom_authenticated') === 'true'
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogin = () => {
    localStorage.setItem('inframonom_authenticated', 'true');
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
  localStorage.removeItem('inframonom_authenticated');
  setIsAuthenticated(false);
};

  const handleGlobalRefresh = () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          {/* Login page */}
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to="/" replace />
                : <LoginPage onLogin={handleLogin} />
            }
          />

          {/* Protected application */}
          <Route
            element={
              isAuthenticated ? (
                <AppLayout
  onRefresh={handleGlobalRefresh}
  refreshing={refreshing}
  onLogout={handleLogout}
/>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route
              index
              element={<DashboardPage key={`dash-${refreshKey}`} />}
            />

            <Route
              path="/projects"
              element={<ProjectsPage key={`proj-${refreshKey}`} />}
            />

            <Route
              path="/projects/:projectId"
              element={<ProjectDetailPage key={`detail-${refreshKey}`} />}
            />

            <Route
              path="/milestones"
              element={<MilestonesPage key={`mile-${refreshKey}`} />}
            />

            <Route
              path="/project-updates"
              element={<ProjectUpdatesPage key={`upd-${refreshKey}`} />}
            />

            <Route
              path="/alerts"
              element={<AlertsPage key={`alert-${refreshKey}`} />}
            />

            <Route
              path="/documents"
              element={<DocumentsPage key={`doc-${refreshKey}`} />}
            />

            <Route
              path="/users"
              element={<UsersPage key={`user-${refreshKey}`} />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;