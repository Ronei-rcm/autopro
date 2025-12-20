import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import HelpAssistant from './components/ai/HelpAssistant';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Future flags do React Router para eliminar warnings
const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

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
// Reports com tratamento de erro melhorado
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(async () => {
  try {
    return await import('./pages/Reports');
  } catch (error) {
    console.error('Erro ao carregar Reports:', error);
    // Retorna um componente de fallback
    return {
      default: () => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro ao carregar relatórios</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Não foi possível carregar a página de relatórios. Por favor, recarregue a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Recarregar Página
          </button>
        </div>
      ),
    };
  }
});
const Settings = lazy(() => import('./pages/Settings'));
const Warranties = lazy(() => import('./pages/Warranties'));
const OrderTemplates = lazy(() => import('./pages/OrderTemplates'));

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
      <BrowserRouter future={routerFutureFlags}>
        <Toaster position="top-right" />
        <ErrorBoundary>
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
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <Reports />
                      </Suspense>
                    </ErrorBoundary>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Users />
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
            <Route
              path="/garantias"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Warranties />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/templates-os"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <OrderTemplates />
                    </Suspense>
                    <HelpAssistant />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

