import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.scss';
import { DashboardPage } from './components/pages/dashboard/DashboardPage';
import { IndexPage } from './components/pages/IndexPage';
import { LoginPage } from './components/pages/LoginPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { RegisterPage } from './components/pages/RegisterPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { AccessLogPage } from './components/pages/AccessLogPage';
import { AdminPage } from './components/pages/AdminPage';
import { ApiDocsPage } from './components/pages/ApiDocsPage';
import { DevToolsPage } from './components/pages/DevToolsPage';
import { GenericDefinitionsPage } from './components/pages/GenericDefinitionsPage';
import { GenericResourcesPage } from './components/pages/GenericResourcesPage';
import { RolesPage } from './components/pages/RolesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public index page */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <IndexPage />}
      />

      {/* Auth routes */}
      <Route
        path="/sign-in"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* API Documentation */}
      <Route path="/docs" element={<ApiDocsPage />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/access-logs"
        element={
          <ProtectedRoute>
            <AccessLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute>
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/definitions"
        element={
          <ProtectedRoute>
            <GenericDefinitionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/resources/:type"
        element={
          <ProtectedRoute>
            <GenericResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dev-tools"
        element={
          <ProtectedRoute>
            <DevToolsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
