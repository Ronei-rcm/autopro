import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import HelpAssistant from './components/ai/HelpAssistant';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Financial = lazy(() => import('./pages/Financial'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '50vh' 
  }}>
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route 
              path="/login" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              } 
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Clients />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/veiculos"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Vehicles />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/fornecedores"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Suppliers />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/estoque"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Inventory />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ordens-servico"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Orders />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Appointments />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/financeiro"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Financial />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Reports />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Settings />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

